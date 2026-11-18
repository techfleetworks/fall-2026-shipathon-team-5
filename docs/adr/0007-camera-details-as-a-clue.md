---
status: proposed
date: 2026-11-18
decision-makers: Team 5 backend developer
---

# Show camera details (EXIF) as a clue, never as "likely real"

## Context and Problem Statement

Real photos, such as a phone picture of a pet, come back "We can't tell":
the AI-image detector never calls a picture real (ADR 0006). Phones and
cameras write EXIF camera details (device, time taken, exposure) into
photos; AI tools don't. In our 500-picture test set, 0 of 250 AI pictures
had them and 7 of 250 real photos did (sharing online usually strips them).
EXIF isn't signed, and anyone can copy it onto any picture. How should
Veritas use it?

## Considered Options

* A. Show it as a reassuring clue; the verdict stays "uncertain"
* B. Answer "likely real" when there are camera details, the detector sees
  almost no sign of AI, and nothing else says AI
* C. Ignore EXIF

## Decision Outcome

Chosen option: "A", because it helps people checking their own photos
without letting copied camera details make an AI picture look verified.

* The clue appears only when nothing else settled the question: no Content
  Credentials, no AI label, and the detector isn't confident it's AI.
* It needs a device name and at least one setting a camera records (date
  taken, exposure, aperture, ISO or focal length). It's skipped if the Software
  field names an AI tool.
* The message says it "usually means a real photo" and that the details "can
  be copied". The verdict stays "uncertain" and there's no likelihood number.
* Text from EXIF is cleaned and limited to 40 characters, since it comes from
  the upload.

### Consequences

* Good, because phone photos checked straight from the device get a clear,
  honest, reassuring answer.
* Good, because an AI picture with copied camera details is still flagged
  when the detector is confident, and the clue isn't shown then.
* Bad, because most photos shared online have no camera details, so they
  still get a plain "We can't tell".
* Bad, because the extension badge stays "?" for these photos.

### Confirmation

`tests/test_camera_details.py` and a Gherkin scenario. Making the clue turn
the verdict into "likely_real" fails 4 tests; showing it when the detector is
confident fails 1.
