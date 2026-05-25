import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth, require_admin
from models.task import TaskModel
from models.user import UserModel
from services.audit_service import log_action
from services.email_service import send_task_assigned
from config import config

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


@tasks_bp.get("")
@require_admin
def list_tasks():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    status = request.args.get("status")
    tasks, total = TaskModel.get_all(
        filters={"status": status} if status else None,
        page=page, per_page=per_page,
    )
    return jsonify({
        "success": True,
        "data": tasks,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": -(-total // per_page),
    })


@tasks_bp.post("")
@require_admin
def create_task():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    assigned_to = request.form.get("assigned_to") or None
    file = request.files.get("product_image")

    if not title or not description or not file:
        return jsonify({"success": False, "message": "title, description and product_image required"}), 400

    from services.storage_service import upload_product_image
    task_id = str(uuid.uuid4())
    image_bytes = file.read()
    image_url = upload_product_image(image_bytes, file.content_type, task_id)

    now = datetime.now(timezone.utc).isoformat()
    task = TaskModel.create({
        "id": task_id,
        "title": title,
        "description": description,
        "product_image_url": image_url,
        "status": "assigned" if assigned_to else "pending",
        "assigned_to": assigned_to,
        "created_by": g.user["id"],
        "created_at": now,
        "updated_at": now,
    })

    if assigned_to:
        user = UserModel.get_by_id(assigned_to)
        if user:
            task_url = f"{config.FRONTEND_URL}/dashboard/user/tasks/{task_id}"
            send_task_assigned(user["email"], user["name"], title, task_url)

    log_action(g.user["id"], "create", "task", task_id, {"title": title})
    return jsonify({"success": True, "data": task}), 201


@tasks_bp.get("/<task_id>")
@require_auth
def get_task(task_id: str):
    task = TaskModel.get_by_id(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found"}), 404
    return jsonify({"success": True, "data": task})


@tasks_bp.put("/<task_id>")
@require_admin
def update_task(task_id: str):
    data = request.json or {}
    allowed = {"title", "description", "assigned_to", "status"}
    update = {k: v for k, v in data.items() if k in allowed}
    task = TaskModel.update(task_id, update)
    log_action(g.user["id"], "update", "task", task_id)
    return jsonify({"success": True, "data": task})


@tasks_bp.delete("/<task_id>")
@require_admin
def delete_task(task_id: str):
    TaskModel.delete(task_id)
    log_action(g.user["id"], "delete", "task", task_id)
    return jsonify({"success": True, "message": "Deleted"})


@tasks_bp.post("/<task_id>/assign")
@require_admin
def assign_task(task_id: str):
    user_id = (request.json or {}).get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "user_id required"}), 400

    task = TaskModel.update(task_id, {"status": "assigned", "assigned_to": user_id})
    user = UserModel.get_by_id(user_id)
    if user:
        task_url = f"{config.FRONTEND_URL}/dashboard/user/tasks/{task_id}"
        send_task_assigned(user["email"], user["name"], task["title"], task_url)

    log_action(g.user["id"], "assign", "task", task_id, {"assigned_to": user_id})
    return jsonify({"success": True, "data": task})


@tasks_bp.put("/<task_id>/start")
@require_auth
def start_task(task_id: str):
    task = TaskModel.update(task_id, {"status": "in_progress"})
    log_action(g.user["id"], "start", "task", task_id)
    return jsonify({"success": True, "data": task})


@tasks_bp.post("/<task_id>/submit")
@require_auth
def submit_task(task_id: str):
    now = datetime.now(timezone.utc).isoformat()
    task = TaskModel.update(task_id, {"status": "submitted", "submitted_at": now})

    from services.email_service import send_task_submitted
    from models.user import UserModel as UM
    # notify admin(s)
    db_users = UM.get_all()
    admins = [u for u in db_users if u.get("role") == "admin"]
    for admin in admins:
        review_url = f"{config.FRONTEND_URL}/dashboard/admin/reviews"
        send_task_submitted(admin["email"], admin["name"], task["title"], review_url)

    log_action(g.user["id"], "submit", "task", task_id)
    return jsonify({"success": True, "data": task})


@tasks_bp.put("/<task_id>/accept")
@require_admin
def accept_task(task_id: str):
    now = datetime.now(timezone.utc).isoformat()
    task = TaskModel.update(task_id, {"status": "accepted", "accepted_at": now})

    from services.email_service import send_task_accepted
    if task.get("assigned_to"):
        user = UserModel.get_by_id(task["assigned_to"])
        if user:
            send_task_accepted(user["email"], user["name"], task["title"])

    log_action(g.user["id"], "accept", "task", task_id)
    return jsonify({"success": True, "data": task})


@tasks_bp.put("/<task_id>/request-revision")
@require_admin
def request_revision(task_id: str):
    comment = (request.json or {}).get("comment", "")
    task = TaskModel.update(task_id, {
        "status": "revision_requested",
        "review_comment": comment,
    })

    from services.email_service import send_revision_requested
    if task.get("assigned_to"):
        user = UserModel.get_by_id(task["assigned_to"])
        if user:
            task_url = f"{config.FRONTEND_URL}/dashboard/user/tasks/{task_id}"
            send_revision_requested(user["email"], user["name"], task["title"], comment, task_url)

    log_action(g.user["id"], "request_revision", "task", task_id, {"comment": comment})
    return jsonify({"success": True, "data": task})


# ── User — my tasks ──────────────────────────────────────────
from flask import Blueprint as _B

my_tasks_bp = Blueprint("my_tasks", __name__, url_prefix="/api/my-tasks")

@my_tasks_bp.get("")
@require_auth
def my_tasks():
    tasks = TaskModel.get_by_user(g.user["id"])
    return jsonify({"success": True, "data": tasks, "total": len(tasks)})
