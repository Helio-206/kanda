import logging

from celery import Celery
from celery.signals import worker_process_init

from app.config import settings

logger = logging.getLogger(__name__)

celery = Celery(
    "kanda",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.ai"],
)

celery.conf.update(
    task_track_started=True,
    accept_content=["json"],
    result_serializer="json",
    task_serializer="json",
    timezone="Africa/Luanda",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@worker_process_init.connect
def preload_vision_model(**_kwargs) -> None:
    """Load Grounding DINO once per worker process to avoid reloading per task."""
    try:
        from app.services.vision import preload_model

        preload_model()
    except Exception:
        logger.exception(
            "Failed to preload Grounding DINO — will retry on first task"
        )
