from models.base import get_db
from datetime import datetime, timezone

def log_action(user_id: str, action: str, entity_type: str, entity_id: str, metadata: dict | None = None):
    try:
        db = get_db()
        db.table("audit_logs").insert({
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception as e:
        print(f"Audit log error: {e}")
