from models.base import get_db


class GenerationModel:
    TABLE = "generated_images"

    @staticmethod
    def create(data: dict) -> dict:
        db = get_db()
        result = db.table(GenerationModel.TABLE).insert(data).execute()
        return result.data[0]

    @staticmethod
    def get_by_task(task_id: str) -> list:
        db = get_db()
        result = (
            db.table(GenerationModel.TABLE)
            .select("*")
            .eq("task_id", task_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    @staticmethod
    def get_by_id(gen_id: str) -> dict | None:
        try:
            db = get_db()
            result = (
                db.table(GenerationModel.TABLE)
                .select("*")
                .eq("id", gen_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception:
            return None

    @staticmethod
    def update(gen_id: str, data: dict) -> dict:
        db = get_db()
        result = db.table(GenerationModel.TABLE).update(data).eq("id", gen_id).execute()
        return result.data[0]

    @staticmethod
    def delete(gen_id: str) -> None:
        db = get_db()
        db.table(GenerationModel.TABLE).delete().eq("id", gen_id).execute()
