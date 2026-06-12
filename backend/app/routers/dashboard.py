from typing import Dict, List

from fastapi import APIRouter

from app.models.occurrence import Occurrence, Status
from app.schemas.occurrence import OccurrenceResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats():
    total = await Occurrence.all().count()
    by_status = {s.value: await Occurrence.filter(status=s).count() for s in Status}
    return {"total": total, "by_status": by_status}


@router.get("/by-priority", response_model=List[OccurrenceResponse])
async def get_occurrences_by_priority(limit: int = 100):
    occs = await Occurrence.all().order_by("-priority").limit(limit)
    return [OccurrenceResponse.from_orm(o) for o in occs]


@router.get("/heatmap")
async def get_heatmap_data():
    occs = await Occurrence.all().only("lat", "lon")
    points = [{"lat": o.lat, "lon": o.lon} for o in occs]
    return {"points": points}
