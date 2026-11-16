---
status: proposed
date: 2026-11-15
decision-makers: Team 5 backend developer
---

# Base picture checks on Content Credentials and AI labels first

## Context and Problem Statement

Veritas promises to help people check pictures ("Using Veritas to verify",
right-click checks in the planned extension, and the images checklist's
advice to look for content credentials). `/api/check-image` only returned
placeholder results. What evidence should the first real version use, and how
do we avoid misleading older adults who may trust the answer completely?

## Decision Drivers

* Never tell someone a picture is real without strong evidence.
* Explain every result in plain language.
* The server must not contact addresses chosen by whoever made the upload.
* Small enough for Render's free plan (0.1 CPU, 512 MB).

## Considered Options

* Content Credentials (C2PA) plus IPTC AI labels, with the official trust lists
* An off-the-shelf AI-image classifier
* Both at once

## Decision Outcome

Chosen option: "Content Credentials plus IPTC AI labels", read with the
official c2pa-python library against the C2PA trust list and the frozen
interim list, bundled in `backend/app/trust/`. It's the most trustworthy
evidence available when present, it's explainable, and it needs no model. A
classifier comes next, measured on its own test set first.

### Consequences

* Good, because a picture whose own signed record says "made with AI" is
  reported as such, naming the tool.
* Good, because a camera claim only counts as "likely real" when the signer is
  on a trust list. An unknown signer's claim is reported as unconfirmed, since
  anyone can sign a picture.
* Good, because remote manifest fetching and certificate revocation (OCSP)
  checks are turned off, so reading an upload never makes the server go online.
* Bad, because most social media pictures carry neither credentials nor
  labels. The usual answer will be "we can't tell", with no likelihood number,
  until a classifier is added. The front end must present that honestly and
  point to reverse image search.
* Bad, because without revocation checks a revoked signing certificate still
  counts as recognised. This is accepted for now.
* Bad, because the trust list must be refreshed by hand (see
  `backend/app/trust/README.md`).
* Neutral: broken files can make the reader slow, so uploads are first checked
  with Pillow, which turns them away in well under a second.
* Neutral: the API contract changed. `ai_likelihood` can be null, and
  `content_credentials` gained `status`, `source`, `signed_by` and `signed_at`.

### Confirmation

Tests use pictures signed with the public C2PA test certificate
(`backend/tests/fixtures/images/`) to cover AI-generated, AI-edited, camera,
tampered and unlabelled pictures, a recognised versus unknown signer, and
that remote fetching stays off. Making the reader trust any signer, or allowing
remote fetching, makes the tests fail. The Docker workflow checks a signed
picture inside the built image.

## Pros and Cons of the Options

### Content Credentials plus IPTC labels

* Good, because it gives strong, explainable evidence when present.
* Bad, because it's often absent.

### Off-the-shelf classifier

* Good, because it always gives an answer.
* Bad, because accuracy on new generators and compressed social media pictures
  is unproven, and it can't explain itself. It needs its own test set before
  older adults rely on it.

### Both at once

* Good, because it gives the widest coverage.
* Bad, because it's too much to build and validate at once, and the model
  needs more memory than the free plan offers.
