from datetime import datetime, timezone
from models.base import get_db


class TaskModel:
    TABLE = "tasks"

    @staticmethod
    def create(data: dict) -> dict:
        db = get_db()
        result = db.table(TaskModel.TABLE).insert(data).execute()
        return result.data[0]

    @staticmethod
    def get_by_id(task_id: str) -> dict | None:
        try:
            db = get_db()
            result = (
                db.table(TaskModel.TABLE)
                .select("*, assigned_user:users!tasks_assigned_to_fkey(id,name,email,avatar_url,role)")
                .eq("id", task_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception:
            return None

    @staticmethod
    def get_all(filters: dict | None = None, page: int = 1, per_page: int = 20) -> tuple[list, int]:
        db = get_db()
        query = db.table(TaskModel.TABLE).select(
            "*, assigned_user:users!tasks_assigned_to_fkey(id,name,email,avatar_url,role)",
            count="exact",
        )
        if filters:
            for k, v in filters.items():
                if v:
                    query = query.eq(k, v)
        offset = (page - 1) * per_page
        result = (
            query.range(offset, offset + per_page - 1)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data, result.count or 0

    @staticmethod
    def update(task_id: str, data: dict) -> dict:
        db = get_db()
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = db.table(TaskModel.TABLE).update(data).eq("id", task_id).execute()
        return result.data[0]

    @staticmethod
    def delete(task_id: str) -> None:
        db = get_db()
        db.table(TaskModel.TABLE).delete().eq("id", task_id).execute()

    @staticmethod
    def get_by_user(user_id: str) -> list:
        db = get_db()
        result = (
            db.table(TaskModel.TABLE)
            .select("*")
            .eq("assigned_to", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data
