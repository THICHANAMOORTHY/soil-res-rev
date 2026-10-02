"""Model inputs ("features"), shared by training (ml/) and the live backend (predictor.py).

Keeping this in ONE place guarantees the model sees exactly the same inputs in the
backend as it did during training. If you change anything here, retrain the models.
"""

from io import BytesIO
from typing import Any

import numpy as np
from PIL import Image

FEED_TYPES = ["maize_silage", "sorghum_silage", "napier_silage", "other"]

# ---------- Readings model ----------

TABULAR_FEATURES = [
    "ph",
    "moisture_pct",
    "temperature_rise_c",
    "ambient_temp_c",
    "rgb_r",
    "rgb_g",
    "rgb_b",
    *[f"feed_{feed}" for feed in FEED_TYPES],
]


def tabular_features(row: dict[str, Any]) -> list[float] | None:
    """One flat database row -> list of numbers in TABULAR_FEATURES order.

    Returns None if a needed reading is missing (e.g. colour sensor not calibrated):
    such samples are skipped in training, and the rules are used for them live.
    """
    needed = ["ph", "moisture_pct", "sample_temp_c", "ambient_temp_c", "rgb_r", "rgb_g", "rgb_b"]
    if any(row.get(key) in (None, "") for key in needed):
        return None
    sample = float(row["sample_temp_c"])
    ambient = float(row["ambient_temp_c"])
    feed = row.get("feed_type") or "other"
    return [
        float(row["ph"]),
        float(row["moisture_pct"]),
        sample - ambient,
        ambient,
        float(row["rgb_r"]),
        float(row["rgb_g"]),
        float(row["rgb_b"]),
        *[1.0 if feed == f else 0.0 for f in FEED_TYPES],
    ]



IMAGE_FEATURES = [
    "white_fraction",    # pale, unsaturated pixels (white mould)
    "green_fraction",    # green-blue pixels (green/blue mould)
    "dark_fraction",     # very dark pixels (black mould, rot)
    "yellow_brown_fraction",  # typical silage colours
    "hue_mean", "hue_std",
    "saturation_mean", "saturation_std",
    "brightness_mean", "brightness_std",
]


def image_features(data: bytes) -> list[float]:
    """JPEG bytes -> list of numbers in IMAGE_FEATURES order."""
    with Image.open(BytesIO(data)) as img:
        hsv = np.asarray(img.convert("RGB").resize((128, 128)).convert("HSV"), dtype=np.float32) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    hue_deg = h * 360.0
    coloured = (s > 0.25) & (v > 0.2)
    return [
        float(np.mean((s < 0.15) & (v > 0.8))),
        float(np.mean(coloured & (hue_deg >= 70) & (hue_deg <= 200))),
        float(np.mean(v < 0.2)),
        float(np.mean(coloured & (hue_deg >= 15) & (hue_deg < 70))),
        float(h.mean()), float(h.std()),
        float(s.mean()), float(s.std()),
        float(v.mean()), float(v.std()),
    ]
