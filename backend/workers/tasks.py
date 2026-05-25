import requests
from workers.celery_app import celery
from models.generation import GenerationModel
from models.task import TaskModel
from services.ai_service import generate_product_image
from services.storage_service import upload_generated_image

@celery.task(bind=True, max_retries=3)
def generate_image_task(self, generation_id: str, task_id: str, gen_type: str):
    """Background task: AI image generation with product consistency."""
    try:
        # Mark as processing
        GenerationModel.update(generation_id, {"status": "processing"})

        # Fetch the task to get the product image URL
        task = TaskModel.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        # Download product image
        product_url = task["product_image_url"]
        response = requests.get(product_url, timeout=30)
        response.raise_for_status()
        product_bytes = response.content

        # Generate
        result_bytes = generate_product_image(gen_type, product_bytes)

        # Upload to Supabase Storage
        image_url = upload_generated_image(result_bytes, task_id, gen_type)

        # Mark as completed
        GenerationModel.update(generation_id, {
            "status": "completed",
            "image_url": image_url,
        })

    except Exception as exc:
        GenerationModel.update(generation_id, {
            "status": "failed",
            "error_message": str(exc)[:500],
        })
        raise self.retry(exc=exc, countdown=10)
