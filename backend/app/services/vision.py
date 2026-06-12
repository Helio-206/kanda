import io
import logging
import threading
from typing import Any, Dict, List, Optional, Tuple

import httpx
import torch
from PIL import Image
from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

from app.config import settings

logger = logging.getLogger(__name__)

# Labels per HF docs: list[list[str]] for batch size 1
TEXT_LABELS = [
    [
        "pothole",
        "road damage",
        "garbage pile",
        "trash",
        "broken street light",
        "flood water",
        "water leak",
        "graffiti",
        "damaged pavement",
    ]
]

LABEL_TO_CATEGORY: Dict[str, str] = {
    "pothole": "buraco",
    "road damage": "buraco",
    "damaged pavement": "buraco",
    "garbage pile": "lixo",
    "trash": "lixo",
    "broken street light": "iluminacao",
    "flood water": "inundacao",
    "water leak": "fuga_de_agua",
    "graffiti": "vandalismo",
}

_model: Optional[AutoModelForZeroShotObjectDetection] = None
_processor: Optional[AutoProcessor] = None
_device: Optional[torch.device] = None
_lock = threading.Lock()


def _resolve_device() -> torch.device:
    configured = (settings.GROUNDING_DINO_DEVICE or "auto").lower()
    if configured == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return torch.device(configured)


def _hub_kwargs() -> Dict[str, str]:
    if settings.hf_token:
        return {"token": settings.hf_token}
    return {}


def preload_model() -> None:
    """Load Grounding DINO into memory. Called once per Celery worker process."""
    global _model, _processor, _device

    with _lock:
        if _model is not None and _processor is not None:
            return

        model_id = settings.GROUNDING_DINO_MODEL_ID
        _device = _resolve_device()
        hub = _hub_kwargs()

        logger.info("Loading Grounding DINO (%s) on %s...", model_id, _device)
        _processor = AutoProcessor.from_pretrained(model_id, **hub)
        _model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id, **hub)
        _model = _model.to(_device)
        _model.eval()

        if _device.type == "cuda":
            gpu_name = torch.cuda.get_device_name(_device)
            logger.info("Grounding DINO ready on %s (%s)", _device, gpu_name)
        else:
            logger.info("Grounding DINO ready on %s", _device)


def _get_model() -> Tuple[AutoModelForZeroShotObjectDetection, AutoProcessor, torch.device]:
    if _model is None or _processor is None or _device is None:
        preload_model()
    return _model, _processor, _device  # type: ignore[return-value]


def _map_label_to_category(label: str) -> str:
    normalized = label.lower().strip().lstrip("a ").strip()
    for key, category in LABEL_TO_CATEGORY.items():
        if key in normalized:
            return category
    return "outro"


def _pick_best_detection(
    detections: List[Dict[str, Any]],
) -> Tuple[str, float, Optional[Dict[str, Any]]]:
    if not detections:
        return "outro", 0.0, None

    best = max(detections, key=lambda d: d.get("score", 0))
    category = best.get("category") or _map_label_to_category(best.get("label", ""))
    confidence = round(float(best.get("score", 0.0)), 2)
    return category, confidence, best


def _download_image_bytes(url: str) -> bytes:
    with httpx.Client(timeout=30) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.content


def _load_image(image_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def _post_process(
    processor: AutoProcessor,
    outputs: Any,
    inputs: Any,
    image: Image.Image,
) -> Dict[str, Any]:
    target_size = (image.height, image.width)
    box_t = settings.GROUNDING_DINO_BOX_THRESHOLD
    text_t = settings.GROUNDING_DINO_TEXT_THRESHOLD

    try:
        results = processor.post_process_grounded_object_detection(
            outputs,
            threshold=box_t,
            text_threshold=text_t,
            target_sizes=[target_size],
        )
    except TypeError:
        try:
            results = processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                threshold=box_t,
                text_threshold=text_t,
                target_sizes=[target_size],
            )
        except TypeError:
            results = processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                box_threshold=box_t,
                text_threshold=text_t,
                target_sizes=[image.size[::-1]],
            )

    return results[0]


def _run_grounding_dino(image: Image.Image) -> List[Dict[str, Any]]:
    model, processor, device = _get_model()

    inputs = processor(images=image, text=TEXT_LABELS, return_tensors="pt").to(device)
    with torch.inference_mode():
        outputs = model(**inputs)

    result = _post_process(processor, outputs, inputs, image)
    labels = result.get("text_labels") or result.get("labels") or []

    detections: List[Dict[str, Any]] = []
    for box, score, label in zip(result["boxes"], result["scores"], labels):
        score_val = float(score.item() if hasattr(score, "item") else score)
        if score_val < settings.GROUNDING_DINO_BOX_THRESHOLD:
            continue

        box_vals = box.tolist() if hasattr(box, "tolist") else list(box)
        label_str = label if isinstance(label, str) else str(label)

        detections.append(
            {
                "label": label_str,
                "score": score_val,
                "box": {
                    "xmin": box_vals[0],
                    "ymin": box_vals[1],
                    "xmax": box_vals[2],
                    "ymax": box_vals[3],
                },
                "category": _map_label_to_category(label_str),
            }
        )

    return detections


def analyze_image(image_url: str) -> Dict[str, Any]:
    """Analyze an occurrence image with local Grounding DINO (transformers).

    Returns category, confidence, detections and model metadata.
    """
    result: Dict[str, Any] = {
        "category": "outro",
        "confidence": 0.0,
        "detections": [],
        "model": settings.GROUNDING_DINO_MODEL_ID,
        "text_labels": TEXT_LABELS[0],
        "backend": "transformers",
    }

    try:
        image_bytes = _download_image_bytes(image_url)
        image = _load_image(image_bytes)
    except Exception as exc:
        logger.warning("Failed to download image %s: %s", image_url, exc)
        result["error"] = "image_download_failed"
        return result

    try:
        detections = _run_grounding_dino(image)
    except Exception as exc:
        logger.exception("Grounding DINO analysis failed: %s", exc)
        result["error"] = "vision_analysis_failed"
        return result

    category, confidence, best = _pick_best_detection(detections)
    result["category"] = category
    result["confidence"] = confidence
    result["detections"] = detections
    if best:
        result["primary_label"] = best.get("label")

    return result
