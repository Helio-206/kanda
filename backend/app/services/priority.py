from math import asin, cos, radians, sin, sqrt
from typing import Iterable, Optional

CATEGORY_SCORES = {
    "buraco": 4,
    "lixo": 2,
    "iluminacao": 3,
    "inundacao": 5,
    "fuga_de_agua": 4,
    "vandalismo": 2,
    "outro": 1,
}


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in kilometers between two lat/lon points."""
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371
    return c * r


def _is_near_sensitive_location(
    lat: float,
    lon: float,
    sensitive_locations: Iterable[dict],
    threshold_km: float = 0.5,
) -> bool:
    for loc in sensitive_locations:
        d = _haversine_distance(lat, lon, loc.get("lat"), loc.get("lon"))
        if d <= threshold_km:
            return True
    return False


def calculate_priority(
    occurrence,
    entities: Iterable,
    sensitive_locations: Iterable[dict] = (),
    category: Optional[str] = None,
    ai_confidence: Optional[float] = None,
) -> int:
    """Calculate priority score (0..10) from location, category and AI confidence."""
    base = 0

    if category:
        base += CATEGORY_SCORES.get(category, 1)

    try:
        for e in entities:
            if getattr(e, "lat", None) is None or getattr(e, "lon", None) is None:
                continue
            d = _haversine_distance(occurrence.lat, occurrence.lon, e.lat, e.lon)
            if d < 1.0:
                base += 4
            elif d < 5.0:
                base += 2
    except Exception:
        pass

    if _is_near_sensitive_location(occurrence.lat, occurrence.lon, sensitive_locations):
        base += 5

    if ai_confidence is not None and ai_confidence >= 0.8:
        base += 1

    return max(0, min(10, int(base)))
