from typing import Any

def require_fields(data: dict, *fields: str) -> list[str]:
    """Return list of missing required fields."""
    return [f for f in fields if not data.get(f)]

def validate_task_status(status: str) -> bool:
    valid = {"pending","assigned","in_progress","submitted","accepted","revision_requested"}
    return status in valid

def validate_generation_type(gen_type: str) -> bool:
    valid = {
        "white_background","theme_background_1","theme_background_2",
        "creative_1","creative_2","model_front","model_side","model_closeup"
    }
    return gen_type in valid
