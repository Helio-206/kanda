import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from app.config import settings
from app.models.occurrence import Occurrence
from app.schemas.occurrence import (
    OccurrenceCreate,
    OccurrenceResponse,
    OccurrenceStatusUpdate,
    TrackingResponse,
)
from app.services.cloudinary import (
    ALLOWED_IMAGE_TYPES,
    CloudinaryNotConfiguredError,
    is_cloudinary_configured,
    upload_occurrence_image,
)
from app.services.identity import generate_tracking_code, get_device_account
from app.tasks import process_ai_analysis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/occurrences", tags=["occurrences"])


def _enqueue_ai_analysis(occurrence_id: UUID) -> None:
    try:
        process_ai_analysis.delay(str(occurrence_id))
    except Exception:
        logger.warning(
            "Could not enqueue AI analysis for %s — is Celery running?",
            occurrence_id,
        )


@router.post("/", response_model=OccurrenceResponse)
async def create_occurrence(payload: OccurrenceCreate):
    """Create an occurrence using a JSON body. Images should be a list of URLs or left empty."""
    tracking_code = payload.tracking_code or generate_tracking_code()

    occ = await Occurrence.create(
        title=payload.title,
        description=payload.description,
        lat=payload.lat,
        lon=payload.lon,
        images=payload.images or [],
        tracking_code=tracking_code,
    )

    _enqueue_ai_analysis(occ.id)
    return OccurrenceResponse.from_orm(occ)


@router.post("/upload", response_model=OccurrenceResponse)
async def create_occurrence_multipart(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    lat: float = Form(...),
    lon: float = Form(...),
    tracking_code: Optional[str] = Form(None),
    device_id: Optional[str] = Header(None),
    files: Optional[List[UploadFile]] = File(None),
):
    """Create an occurrence using multipart/form-data (useful to upload images)."""
    if files and not is_cloudinary_configured(settings):
        raise HTTPException(
            status_code=503,
            detail="Image upload is not configured. Set Cloudinary credentials.",
        )

    device = None
    if device_id:
        device = await get_device_account(device_id)

    images: List[str] = []
    for upload in files or []:
        if upload.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image type: {upload.content_type}. Use JPEG, PNG or WebP.",
            )

        content = await upload.read()
        if not content:
            continue

        try:
            url = upload_occurrence_image(content)
            images.append(url)
        except CloudinaryNotConfiguredError:
            raise HTTPException(
                status_code=503,
                detail="Image upload is not configured. Set Cloudinary credentials.",
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception as exc:
            logger.exception("Cloudinary upload failed")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload image: {exc}",
            )

    tracking = tracking_code or generate_tracking_code()

    occ = await Occurrence.create(
        title=title,
        description=description,
        lat=lat,
        lon=lon,
        images=images,
        tracking_code=tracking,
        device=device,
    )

    _enqueue_ai_analysis(occ.id)
    return OccurrenceResponse.from_orm(occ)


@router.get("/me", response_model=List[OccurrenceResponse])
async def get_my_occurrences(
    device_id: Optional[str] = Header(None), tracking_code: Optional[str] = None
):
    if tracking_code:
        occs = (
            await Occurrence.filter(tracking_code=tracking_code)
            .order_by("-created_at")
            .all()
        )
    elif device_id:
        device = await get_device_account(device_id)
        occs = await Occurrence.filter(device=device).order_by("-created_at").all()
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide device_id header or tracking_code query param",
        )

    return [OccurrenceResponse.from_orm(o) for o in occs]


@router.get("/track/{tracking_code}", response_model=TrackingResponse)
async def track_occurrence(tracking_code: str):
    occ = await Occurrence.get_or_none(tracking_code=tracking_code)
    if not occ:
        raise HTTPException(status_code=404, detail="Not found")

    return TrackingResponse(
        tracking_code=occ.tracking_code, status=occ.status, updated_at=occ.updated_at
    )


@router.patch("/{occurrence_id}/status", response_model=OccurrenceResponse)
async def update_occurrence_status(
    occurrence_id: UUID, payload: OccurrenceStatusUpdate
):
    occ = await Occurrence.get_or_none(id=occurrence_id)
    if not occ:
        raise HTTPException(status_code=404, detail="Not found")

    occ.status = payload.status
    await occ.save()
    return OccurrenceResponse.from_orm(occ)
