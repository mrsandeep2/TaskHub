from models.base import get_db


class UserModel:
    TABLE = "users"

    @staticmethod
    def get_by_id(user_id: str) -> dict | None:
        try:
            db = get_db()
            result = db.table(UserModel.TABLE).select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception:
            return None

    @staticmethod
    def get_by_email(email: str) -> dict | None:
        try:
            db = get_db()
            result = db.table(UserModel.TABLE).select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception:
            return None

    @staticmethod
    def upsert(data: dict) -> dict:
        db = get_db()
        result = db.table(UserModel.TABLE).upsert(data, on_conflict="email").execute()
        return result.data[0]

    @staticmethod
    def get_all() -> list:
        db = get_db()
        result = db.table(UserModel.TABLE).select("*").order("created_at", desc=True).execute()
        return result.data

    @staticmethod
    def update_last_active(user_id: str) -> None:
        from datetime import datetime, timezone
        db = get_db()
        db.table(UserModel.TABLE).update(
            {"last_active": datetime.now(timezone.utc).isoformat()}
        ).eq("id", user_id).execute()
