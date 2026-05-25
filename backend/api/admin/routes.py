from flask import Blueprint, request, jsonify
from middleware.auth import require_admin
from models.user import UserModel
from models.task import TaskModel
from models.base import get_db

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/stats")
@require_admin
def stats():
    db = get_db()
    users_count = db.table("users").select("*", count="exact").execute().count or 0
    tasks_all, total_tasks = TaskModel.get_all(per_page=9999)

    status_counts: dict[str, int] = {}
    for t in tasks_all:
        s = t.get("status", "pending")
        status_counts[s] = status_counts.get(s, 0) + 1

    ai_count = db.table("generated_images").select("*", count="exact").execute().count or 0

    return jsonify({
        "success": True,
        "data": {
            "total_users": users_count,
            "total_tasks": total_tasks,
            "pending": status_counts.get("pending", 0),
            "submitted": status_counts.get("submitted", 0),
            "accepted": status_counts.get("accepted", 0),
            "revision_requests": status_counts.get("revision_requested", 0),
            "ai_generation_count": ai_count,
        },
    })


@admin_bp.get("/users")
@require_admin
def list_users():
    users = UserModel.get_all()
    return jsonify({"success": True, "data": users, "total": len(users)})


@admin_bp.get("/audit-logs")
@require_admin
def audit_logs():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    db = get_db()
    offset = (page - 1) * per_page
    result = (
        db.table("audit_logs")
        .select("*, user:users(id,name,email)", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + per_page - 1)
        .execute()
    )
    return jsonify({
        "success": True,
        "data": result.data,
        "total": result.count or 0,
        "page": page,
        "per_page": per_page,
    })


@admin_bp.get("/analytics")
@require_admin
def analytics():
    # Simplified analytics — in production use more complex queries
    db = get_db()
    tasks_all, _ = TaskModel.get_all(per_page=9999)
    gens = db.table("generated_images").select("type,status,created_at").execute().data

    type_counts: dict[str, int] = {}
    for g in gens:
        t = g.get("type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

    return jsonify({
        "success": True,
        "data": {
            "generation_by_type": type_counts,
            "total_tasks": len(tasks_all),
            "total_images": len(gens),
        },
    })
