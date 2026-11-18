"""Reads the camera details (EXIF) that phones and cameras add to photos.

Phones and cameras write the device, the time the photo was taken and its
exposure settings into the picture. AI image tools don't. In our test set, 0
of 250 AI pictures had them, and 7 of 250 real photos did (sharing online
usually strips them; see evaluation/image_detectors).

So these details are a hint of a real photo, never proof: they aren't signed,
and anyone can copy them onto any picture with free tools. They are only ever
shown as a clue, and never turn an answer into "likely real" (ADR 0007).

Everything read here comes from the uploaded file, so it's cleaned and
shortened before it's shown to anyone.
"""

import io
import re
from dataclasses import dataclass
from datetime import datetime

from PIL import Image

_MAKE, _MODEL, _SOFTWARE, _EXIF_IFD = 0x010F, 0x0110, 0x0131, 0x8769
_DATE_TAKEN, _EXPOSURE, _F_NUMBER, _ISO, _FOCAL_LENGTH = 0x9003, 0x829A, 0x829D, 0x8827, 0x920A

# Some AI tools and editors name themselves in the Software field. A picture
# saying it came from one of these doesn't get the camera clue.
_AI_SOFTWARE = re.compile(
    r"dall|midjourney|stable ?diffusion|firefly|imagen|flux|comfyui|automatic1111|"
    r"novelai|leonardo|ideogram|gpt|chatgpt|gemini|copilot|grok|sora|runway",
    re.IGNORECASE,
)
_MAX_TEXT = 40


@dataclass(frozen=True)
class CameraDetails:
    device: str
    taken: datetime | None

    @property
    def taken_text(self) -> str | None:
        if self.taken is None:
            return None
        return f"{self.taken.day} {self.taken:%B %Y}"


def _clean(value: object) -> str:
    if isinstance(value, bytes):
        value = value.decode("utf-8", "ignore")
    text = re.sub(r"[^\w .,+\-()/]", "", str(value or ""))
    return " ".join(text.split())[:_MAX_TEXT].strip()


def _date(value: object) -> datetime | None:
    try:
        return datetime.strptime(str(value).strip("\x00 ")[:19], "%Y:%m:%d %H:%M:%S")
    except ValueError:
        return None


def read_camera_details(data: bytes) -> CameraDetails | None:
    """Return the camera details, or None when the picture doesn't look like
    it came straight from a camera or phone."""
    try:
        with Image.open(io.BytesIO(data)) as image:
            exif = image.getexif()
            capture = exif.get_ifd(_EXIF_IFD) if exif else {}
    except Exception:  # damaged or unusual metadata: just no clue
        return None
    if not exif:
        return None

    make, model = _clean(exif.get(_MAKE)), _clean(exif.get(_MODEL))
    if not (make or model):
        return None
    if _AI_SOFTWARE.search(_clean(exif.get(_SOFTWARE))):
        return None
    # A device name alone is easy to have by accident; also require at least
    # one setting a camera records when it takes the photo.
    if not any(tag in capture for tag in (_DATE_TAKEN, _EXPOSURE, _F_NUMBER, _ISO, _FOCAL_LENGTH)):
        return None

    device = model if model.lower().startswith(make.lower()) else f"{make} {model}".strip()
    return CameraDetails(device=device[:_MAX_TEXT], taken=_date(capture.get(_DATE_TAKEN)))
