import logging
import re
from typing import Optional, Union

import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


class CloudinaryNotConfiguredError(RuntimeError):
    pass


def is_cloudinary_configured(settings) -> bool:
    return bool(
        getattr(settings, "CLOUDINARY_CLOUD_NAME", None)
        and getattr(settings, "CLOUDINARY_API_KEY", None)
        and getattr(settings, "CLOUDINARY_API_SECRET", None)
    )


def init_cloudinary(settings) -> bool:
    """Initialize cloudinary using settings. Returns True when configured."""
    if not is_cloudinary_configured(settings):
        logger.warning("Cloudinary credentials not configured — image upload disabled")
        return False

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    return True


def upload_occurrence_image(
    file: Union[bytes, object],
    public_id: Optional[str] = None,
) -> str:
    """Upload an image to Cloudinary.

    Accepts raw bytes or a file-like object (e.g. SpooledTemporaryFile).
    Returns the secure URL on success.
    """
    if not cloudinary.config().cloud_name:
        raise CloudinaryNotConfiguredError("Cloudinary is not configured")

    if isinstance(file, (bytes, bytearray)):
        if len(file) > MAX_UPLOAD_BYTES:
            raise ValueError("Image exceeds maximum allowed size (10 MB)")
        upload_target = file
    else:
        upload_target = getattr(file, "file", file)
        if hasattr(upload_target, "seek"):
            upload_target.seek(0)

    options = {
        "folder": "kanda/occurrences",
        "resource_type": "image",
        "transformation": [
            {"quality": "auto", "fetch_format": "auto"},
            {"width": 1280, "crop": "limit"},
        ],
    }
    if public_id:
        options["public_id"] = public_id

    result = cloudinary.uploader.upload(upload_target, **options)
    secure_url = result.get("secure_url")
    if not secure_url:
        raise RuntimeError("Cloudinary upload succeeded but returned no URL")
    return secure_url


def validate_cloudinary_url(url: str) -> bool:
    return bool(re.search(r"res\.cloudinary\.com", url))


def vision_delivery_url(url: str, max_width: int = 1280) -> str:
    """Return a Cloudinary URL optimized for vision model inference."""
    if not validate_cloudinary_url(url):
        return url

    marker = "/upload/"
    if marker not in url:
        return url

    transform = f"w_{max_width},c_limit,q_auto,f_jpg"
    prefix, suffix = url.split(marker, 1)
    if suffix.startswith(f"{transform}/"):
        return url

    return f"{prefix}{marker}{transform}/{suffix}"
