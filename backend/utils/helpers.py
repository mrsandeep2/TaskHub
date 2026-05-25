import re
from datetime import datetime, timezone

def paginate(query_result, page: int, per_page: int) -> dict:
    return {
        "page": page,
        "per_page": per_page,
        "total_pages": -(-len(query_result) // per_page),
    }

def sanitize_string(s: str) -> str:
    """Strip dangerous characters from user input."""
    return re.sub(r"[<>\"'%;()&+]", "", s).strip()

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()
