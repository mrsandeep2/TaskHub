import jwt
from functools import wraps
from flask import request, jsonify, g
from config import config
from models.user import UserModel

def get_token() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return request.cookies.get("access_token")

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token()
        if not token:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
            user = UserModel.get_by_id(payload["sub"])
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 401
            g.user = user
            UserModel.update_last_active(user["id"])
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token()
        if not token:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
            user = UserModel.get_by_id(payload["sub"])
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 401
            if user.get("role") != "admin":
                return jsonify({"success": False, "message": "Forbidden: Admin required"}), 403
            g.user = user
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated
