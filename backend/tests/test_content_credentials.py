"""Content Credentials reading, using pictures signed with the C2PA test
certificate (tests/fixtures/images, see README there)."""

import pytest

from app.services.content_credentials import (
    TrustStore,
    default_trust_store,
    read_credentials,
    reader_settings,
)
from app.services.image_check import check_image
from tests.conftest import FIXTURES, PNG_BYTES, fixture_bytes

# Treat the C2PA *test* root as trusted, to exercise the "trusted" path.
TEST_TRUST = TrustStore(anchors=(FIXTURES / "test_trust_anchors.pem").read_text())


@pytest.mark.parametrize(
    "name,source,generator",
    [
        ("ai_generated.jpg", "ai_generated", "Example Image Generator"),
        ("ai_edited.jpg", "ai_modified", "Example Photo Editor"),
        ("camera.jpg", "camera", "Example Camera"),
    ],
)
def test_reads_how_the_picture_was_made(name, source, generator):
    creds = read_credentials(fixture_bytes(name), "image/jpeg", TEST_TRUST)
    assert creds.status == "trusted"
    assert creds.source == source
    assert creds.generator == generator


def test_test_certificate_is_not_trusted_by_the_real_lists():
    creds = read_credentials(fixture_bytes("ai_generated.jpg"), "image/jpeg")
    assert creds.status == "untrusted_signer"
    assert creds.source == "ai_generated"


def test_changed_picture_is_invalid():
    creds = read_credentials(fixture_bytes("tampered.jpg"), "image/jpeg", TEST_TRUST)
    assert creds.status == "invalid"
    assert creds.problems


def test_unsigned_ai_label_is_read():
    creds = read_credentials(fixture_bytes("xmp_ai_tag.jpg"), "image/jpeg")
    assert creds.status == "none"
    assert creds.metadata_source == "ai_generated"


def test_plain_picture_has_no_credentials():
    creds = read_credentials(PNG_BYTES, "image/png")
    assert (creds.status, creds.found, creds.metadata_source) == ("none", False, None)


def test_reader_never_fetches_from_the_internet():
    verify = reader_settings("anchors", None, None)["verify"]
    assert verify["remote_manifest_fetch"] is False
    assert verify["ocsp_fetch"] is False


def test_real_trust_lists_are_bundled():
    store = default_trust_store()
    assert store.anchors.count("BEGIN CERTIFICATE") > 10
    assert store.legacy_anchors and store.legacy_allowed


def test_camera_photo_from_trusted_signer_is_likely_real():
    result = check_image(fixture_bytes("camera.jpg"), TEST_TRUST)
    assert result.verdict == "likely_real"


def test_camera_claim_from_unknown_signer_is_not_called_real():
    # Anyone can sign a picture claiming it came from a camera, so an unknown
    # signer must never make an AI picture look verified.
    result = check_image(fixture_bytes("camera.jpg"))
    assert result.verdict == "uncertain"
    assert result.ai_likelihood is None


def test_no_evidence_gives_no_number():
    result = check_image(PNG_BYTES)
    assert result.verdict == "uncertain"
    assert result.ai_likelihood is None
    assert result.is_example is False
