"""Reads how a picture was made from the data some apps and cameras attach.

Two kinds of data are checked:

1. Content Credentials (C2PA): a signed record of how the picture was made and
   edited. We check the signature and whether the signer is on the official
   C2PA trust list (or the older, frozen interim list).
2. IPTC "digital source type" labels: unsigned tags some AI tools add. Easy to
   remove, but rarely added falsely.

Most pictures from social media have neither, because many sites strip them
when you upload. Finding nothing tells us nothing about whether a picture is
real.

Safety: the library is told never to fetch anything from the internet while
reading (no remote manifests, no certificate revocation checks), so a picture
can't make our server contact an address of the uploader's choosing.
"""

import io
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Literal

import c2pa

TRUST_DIR = Path(__file__).resolve().parent.parent / "trust"

Status = Literal["none", "trusted", "trusted_legacy", "untrusted_signer", "invalid", "unreadable"]
Source = Literal["ai_generated", "ai_modified", "camera", "computer_made", "unknown"]

_IPTC = "http://cv.iptc.org/newscodes/digitalsourcetype/"
_AI = {"trainedAlgorithmicMedia"}
_AI_COMPOSITE = {"compositeWithTrainedAlgorithmicMedia"}
_CAMERA = {"digitalCapture", "computationalCapture"}
_COMPUTER_MADE = {"algorithmicMedia", "digitalCreation", "digitalArt", "dataDrivenMedia"}

# Failure codes that only mean "we don't recognise the signer".
_UNTRUSTED_ONLY = {"signingCredential.untrusted"}

_XMP_PACKET = re.compile(rb"<x:xmpmeta.*?</x:xmpmeta>", re.DOTALL)
_XMP_SOURCE = re.compile(rb"digitalsourcetype/([A-Za-z]+)")


@dataclass(frozen=True)
class TrustStore:
    """PEM text for the trust lists used to decide whether a signer is known."""

    anchors: str
    legacy_anchors: str | None = None
    legacy_allowed: str | None = None
    config: str | None = None


@dataclass(frozen=True)
class Credentials:
    status: Status = "none"
    source: Source = "unknown"
    signed_by: str | None = None
    issuer: str | None = None
    generator: str | None = None
    signed_at: str | None = None
    # From unsigned IPTC labels, when there are no Content Credentials.
    metadata_source: Source | None = None
    problems: list[str] = field(default_factory=list)

    @property
    def found(self) -> bool:
        return self.status not in ("none", "unreadable")


@lru_cache
def default_trust_store() -> TrustStore:
    def read(name: str) -> str:
        return (TRUST_DIR / name).read_text(encoding="utf-8")

    return TrustStore(
        anchors=read("C2PA-TRUST-LIST.pem"),
        legacy_anchors=read("legacy-anchors.pem"),
        legacy_allowed=read("legacy-allowed.pem"),
        config=read("store.cfg"),
    )


def reader_settings(anchors: str, allowed: str | None, config: str | None) -> dict:
    trust: dict[str, str] = {"trust_anchors": anchors}
    if allowed:
        trust["allowed_list"] = allowed
    if config:
        trust["trust_config"] = config
    return {
        "trust": trust,
        "verify": {
            "verify_trust": True,
            # Never contact the internet because of what's inside an upload.
            "remote_manifest_fetch": False,
            "ocsp_fetch": False,
        },
    }


def _read(data: bytes, mime: str | None, settings: dict) -> tuple[dict, dict] | None:
    """Return (active manifest, validation results), or None if there's no manifest."""
    context = c2pa.Context(settings=c2pa.Settings.from_dict(settings))
    try:
        reader = c2pa.Reader.try_create(mime or "", io.BytesIO(data), context=context)
        if reader is None:
            return None
        try:
            return reader.get_active_manifest() or {}, reader.get_validation_results() or {}
        finally:
            reader.close()
    finally:
        context.close()


def _failure_codes(results: dict) -> set[str]:
    active = results.get("activeManifest") or {}
    return {item.get("code", "") for item in active.get("failure") or []}


def _agent_name(agent: object) -> str | None:
    if isinstance(agent, dict):
        return agent.get("name")
    return agent if isinstance(agent, str) else None


def _describe(manifest: dict) -> tuple[Source, str | None]:
    """Work out how the picture was made, and by which tool, from its actions."""
    actions = [
        action
        for assertion in manifest.get("assertions") or []
        if str(assertion.get("label", "")).startswith("c2pa.actions")
        for action in (assertion.get("data") or {}).get("actions") or []
    ]
    source: Source = "unknown"
    generator = None
    for action in actions:
        kind = str(action.get("digitalSourceType", "")).removeprefix(_IPTC)
        agent = _agent_name(action.get("softwareAgent"))
        created = action.get("action") == "c2pa.created"
        if kind in _AI and created:
            return "ai_generated", agent
        if kind in _AI | _AI_COMPOSITE:
            source, generator = "ai_modified", agent
        elif source == "unknown" and created and kind in _CAMERA:
            source, generator = "camera", agent
        elif source == "unknown" and created and kind in _COMPUTER_MADE:
            source, generator = "computer_made", agent

    if generator is None:
        info = manifest.get("claim_generator_info") or []
        generator = (info[0].get("name") if info else None) or manifest.get("claim_generator")
    return source, generator


def _metadata_source(data: bytes) -> Source | None:
    """Look for IPTC digital source type labels in the picture's XMP metadata."""
    for packet in _XMP_PACKET.findall(data):
        for kind in _XMP_SOURCE.findall(packet):
            name = kind.decode("ascii", "ignore")
            if name in _AI:
                return "ai_generated"
            if name in _AI_COMPOSITE:
                return "ai_modified"
    return None


def read_credentials(
    data: bytes, mime: str | None = None, trust: TrustStore | None = None
) -> Credentials:
    trust = trust or default_trust_store()
    try:
        found = _read(data, mime, reader_settings(trust.anchors, None, trust.config))
    except c2pa.C2paError:
        return Credentials(status="unreadable", metadata_source=_metadata_source(data))
    if found is None:
        return Credentials(status="none", metadata_source=_metadata_source(data))

    manifest, results = found
    failures = _failure_codes(results)
    status: Status
    if not failures:
        status = "trusted"
    elif failures <= _UNTRUSTED_ONLY:
        status = "untrusted_signer"
        # Credentials signed under the older, frozen interim list are reported
        # separately, as the C2PA asks validators to do.
        if trust.legacy_anchors:
            legacy = _read(
                data, mime, reader_settings(trust.legacy_anchors, trust.legacy_allowed, trust.config)
            )
            if legacy is not None and not _failure_codes(legacy[1]):
                status = "trusted_legacy"
    else:
        status = "invalid"

    source, generator = _describe(manifest)
    signature = manifest.get("signature_info") or {}
    return Credentials(
        status=status,
        source=source,
        signed_by=signature.get("common_name"),
        issuer=signature.get("issuer"),
        generator=generator,
        signed_at=signature.get("time"),
        problems=sorted(failures - _UNTRUSTED_ONLY),
    )
