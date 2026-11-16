# Test pictures

Small pictures made for the tests, signed with the **C2PA test certificate**
from the c2pa-python project (MIT/Apache-2.0). That certificate is public and
for testing only, so the real trust lists treat these pictures as signed by an
unknown signer. `test_trust_anchors.pem` is the matching test root; tests use
it to exercise the "trusted" path.

| File | Content Credentials say |
|---|---|
| `ai_generated.jpg` | Created by an AI tool ("Example Image Generator") |
| `ai_edited.jpg` | Camera photo, then edited with AI ("Example Photo Editor") |
| `camera.jpg` | Taken with a camera ("Example Camera") |
| `tampered.jpg` | Copy of `ai_generated.jpg` with pixels changed after signing |
| `xmp_ai_tag.jpg` | No credentials; unsigned IPTC label "trainedAlgorithmicMedia" |
| `plain.jpg` | Nothing |
