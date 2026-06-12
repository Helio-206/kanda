from datetime import datetime
from enum import Enum as PyEnum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class OccurrenceStatus(str, PyEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class TrackingResponse(BaseModel):
    tracking_code: str
    status: OccurrenceStatus
    updated_at: datetime


class OccurrenceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lat: float
    lon: float
    images: Optional[List[str]] = None
    tracking_code: Optional[str] = None


class OccurrenceResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    lat: float
    lon: float
    images: List[str] = []
    status: OccurrenceStatus
    tracking_code: Optional[str]
    priority: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class OccurrenceStatusUpdate(BaseModel):
    status: OccurrenceStatus
