import asyncio
import logging

from app.config import settings
from app.services.cloudinary import vision_delivery_url
from app.services.priority import calculate_priority
from app.services.vision import analyze_image
from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3, ignore_result=True)
def process_ai_analysis(self, occurrence_id: str) -> None:
    """Run image analysis in the background and update the occurrence."""
    try:
        asyncio.run(_run(occurrence_id))
    except Exception as exc:
        logger.exception("AI analysis failed for occurrence %s", occurrence_id)
        raise self.retry(exc=exc, countdown=60)


async def _run(occurrence_id: str) -> None:
    from tortoise import Tortoise

    from app.models.entity import Entity
    from app.models.occurrence import Occurrence

    await Tortoise.init(
        db_url=settings.DATABASE_URL, modules={"models": ["app.models"]}
    )

    try:
        occ = await Occurrence.get_or_none(id=occurrence_id)
        if not occ:
            logger.warning("Occurrence %s not found for AI analysis", occurrence_id)
            return

        analysis = {"category": "outro", "confidence": 0.0, "detections": []}

        if occ.images:
            first_image = (
                occ.images[0]
                if isinstance(occ.images, (list, tuple)) and occ.images
                else None
            )
            if first_image:
                image_url = vision_delivery_url(first_image)
                analysis = analyze_image(image_url)

        occ.metadata = analysis
        occ.priority = calculate_priority(
            occ,
            await Entity.all(),
            category=analysis.get("category"),
            ai_confidence=analysis.get("confidence"),
        )
        await occ.save()
        logger.info(
            "AI analysis complete for %s: category=%s confidence=%s",
            occurrence_id,
            analysis.get("category"),
            analysis.get("confidence"),
        )
    finally:
        await Tortoise.close_connections()
