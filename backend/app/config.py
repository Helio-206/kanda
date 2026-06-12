from typing import Optional

from pydantic import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Kanda Backend"
    DATABASE_URL: str = "postgres://cidade_user:cidade_pass@db:5432/cidade_em_foco"
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Local Grounding DINO (transformers)
    GROUNDING_DINO_MODEL_ID: str = "IDEA-Research/grounding-dino-tiny"
    GROUNDING_DINO_DEVICE: str = "auto"  # auto | cpu | cuda
    GROUNDING_DINO_BOX_THRESHOLD: float = 0.4
    GROUNDING_DINO_TEXT_THRESHOLD: float = 0.3
    HF_TOKEN: Optional[str] = None  # optional, for gated models / faster hub downloads

    SECRET_KEY: str = "change-me"

    @property
    def hf_token(self) -> Optional[str]:
        return self.HF_TOKEN

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
