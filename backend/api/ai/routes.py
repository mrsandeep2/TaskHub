import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from middleware.rate_limit import limiter
from models.generation import GenerationModel
from models.task import TaskModel
from services.audit_service import log_action
from config import config

ai_bp = Blueprint("ai", __name__, url_prefix="/api")

VALID_TYPES = {
    "white_background", "theme_background_1", "theme_background_2",
    "creative_1", "creative_2", "model_front", "model_side", "model_closeup"
}


@ai_bp.post("/tasks/<task_id>/generate")
@require_auth
@limiter.limit(config.AI_RATE_LIMIT)
def generate(task_id: str):
    gen_type = (request.json or {}).get("type")
    if gen_type not in VALID_TYPES:
        return jsonify({"success": False, "message": f"Invalid type. Must be one of: {', '.join(VALID_TYPES)}"}), 400

    task = TaskModel.get_by_id(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found"}), 404

    # Create generation record
    gen_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    generation = GenerationModel.create({
        "id": gen_id,
        "task_id": task_id,
        "type": gen_type,
        "status": "queued",
        "is_final": False,
        "created_at": now,
    })

    # Ensure task is in_progress
    if task["status"] in ("assigned", "pending"):
        TaskModel.update(task_id, {"status": "in_progress"})

    # Dispatch background job
    try:
        from workers.tasks import generate_image_task
        job = generate_image_task.delay(gen_id, task_id, gen_type)
        GenerationModel.update(gen_id, {"job_id": job.id})
    except Exception:
        # If Celery not available, run synchronously (dev mode)
        _run_sync(gen_id, task_id, gen_type)

    log_action(g.user["id"], "generate", "generation", gen_id, {"type": gen_type})
    return jsonify({"success": True, "data": {"job_id": gen_id, "status": "queued"}}), 202


def _run_sync(gen_id: str, task_id: str, gen_type: str):
    """Fallback sync generation when Celery is unavailable."""
    import threading
    def _worker():
        try:
            from workers.tasks import generate_image_task
            generate_image_task(gen_id, task_id, gen_type)
        except Exception:
            from services.ai_service import generate_product_image
            from services.storage_service import upload_generated_image
            import requests as req
            task = TaskModel.get_by_id(task_id)
            GenerationModel.update(gen_id, {"status": "processing"})
            try:
                r = req.get(task["product_image_url"], timeout=30)
                img_bytes = generate_product_image(gen_type, r.content)
                url = upload_generated_image(img_bytes, task_id, gen_type)
                GenerationModel.update(gen_id, {"status": "completed", "image_url": url})
            except Exception as e:
                GenerationModel.update(gen_id, {"status": "failed", "error_message": str(e)[:500]})
    threading.Thread(target=_worker, daemon=True).start()


@ai_bp.get("/jobs/<job_id>/status")
@require_auth
def job_status(job_id: str):
    gen = GenerationModel.get_by_id(job_id)
    if not gen:
        return jsonify({"success": False, "message": "Job not found"}), 404
    return jsonify({"success": True, "data": {
        "job_id": job_id,
        "status": gen["status"],
        "result_url": gen.get("image_url"),
        "error": gen.get("error_message"),
    }})


@ai_bp.get("/tasks/<task_id>/generations")
@require_auth
def list_generations(task_id: str):
    gens = GenerationModel.get_by_task(task_id)
    return jsonify({"success": True, "data": gens})


@ai_bp.delete("/generations/<gen_id>")
@require_auth
def delete_generation(gen_id: str):
    GenerationModel.delete(gen_id)
    log_action(g.user["id"], "delete", "generation", gen_id)
    return jsonify({"success": True, "message": "Deleted"})


@ai_bp.put("/generations/<gen_id>/mark-final")
@require_auth
def mark_final(gen_id: str):
    gen = GenerationModel.get_by_id(gen_id)
    if not gen:
        return jsonify({"success": False, "message": "Not found"}), 404
    updated = GenerationModel.update(gen_id, {"is_final": not gen.get("is_final", False)})
    return jsonify({"success": True, "data": updated})
