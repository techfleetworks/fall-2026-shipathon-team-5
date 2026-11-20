---
status: proposed
date: 2026-11-18
decision-makers: Team 5 backend developer
---

# Show camera details and "no signs of AI" as clues, never as "likely real"

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

### Also: "no signs of AI at all"

We used the 250 real photos in the test set to ask whether a very low
detector score could mean "likely real" (`evaluation/image_detectors`, holdout
pictures not used to set the cut-off):

| Cut-off | Real photos at or below it | AI pictures at or below it |
|---|---|---|
| Loose (0.0019) | 55–57% | 6% (up to 15% in some groups) |
| Strict (0.00035) | 27–35% | 2% (5% for the newest generators) |
| Very strict (0.00016) | 19–26% | 1–2% (up to 5% for the newest generators) |

Some AI pictures fool the detector completely, so a "likely real" verdict
would sometimes reassure people about a fake they were already suspicious
of. Instead, at or below the strict cut-off
(`APP_CLASSIFIER_NO_SIGNS_THRESHOLD`, 0.00035), the answer stays "uncertain"
with a stronger clue: "no signs of AI at all, which is common for real
photos, but some new AI pictures fool it too". Low-memory mode, as on Render,
agreed with these scores on 44 of 45 near-zero pictures.

### Consequences

* Good, because phone photos checked straight from the device get a clear,
  honest, reassuring answer.
* Good, because an AI picture with copied camera details is still flagged
  when the detector is confident, and the clue isn't shown then.
* Bad, because most photos shared online have no camera details, so they
  still get a plain "We can't tell".
* Bad, because the extension badge stays "?" for these photos.

### Confirmation

`tests/test_camera_details.py` and a Gherkin scenario. Making the camera clue
turn the verdict into "likely_real" fails 4 tests; showing it when the
detector is confident fails 1; making "no signs at all" answer "likely_real"
fails 3.
