import uuid
from supabase import create_client, Client
from config import config

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)
    return _client


def _get_public_url(filename: str) -> str:
    """supabase-py 2.x returns a string directly from get_public_url."""
    result = get_client().storage.from_("task-images").get_public_url(filename)
    # SDK v2 returns str directly; guard against dict response in older versions
    if isinstance(result, dict):
        return result.get("publicUrl") or result.get("data", {}).get("publicUrl", "")
    return result


def upload_product_image(file_bytes: bytes, content_type: str, task_id: str) -> str:
    filename = f"products/{task_id}/{uuid.uuid4()}.jpg"
    get_client().storage.from_("task-images").upload(
        path=filename,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return _get_public_url(filename)


def upload_generated_image(image_bytes: bytes, task_id: str, gen_type: str) -> str:
    filename = f"generated/{task_id}/{gen_type}/{uuid.uuid4()}.jpg"
    get_client().storage.from_("task-images").upload(
        path=filename,
        file=image_bytes,
        file_options={"content-type": "image/jpeg", "upsert": "true"},
    )
    return _get_public_url(filename)
