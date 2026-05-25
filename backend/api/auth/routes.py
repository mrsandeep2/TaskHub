import uuid
import jwt
import requests as http_requests
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode
from flask import Blueprint, request, jsonify, redirect, g
from config import config
from models.user import UserModel
from middleware.auth import require_auth

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def _base_url(req) -> str:
    """Get base URL, respecting proxy headers for Railway/Render."""
    forwarded_proto = req.headers.get("X-Forwarded-Proto", "")
    if forwarded_proto:
        host = req.headers.get("X-Forwarded-Host", req.host)
        return f"{forwarded_proto}://{host}"
    return req.host_url.rstrip("/")


# ── Google OAuth ──────────────────────────────────────────────
@auth_bp.get("/oauth/google")
def google_login():
    base = _base_url(request)
    params = urlencode({
        "client_id": config.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{base}/api/auth/oauth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    })
    return redirect(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@auth_bp.get("/oauth/google/callback")
def google_callback():
    code = request.args.get("code")
    error = request.args.get("error")
    if error or not code:
        return redirect(f"{config.FRONTEND_URL}/auth/login?error=oauth_denied")

    base = _base_url(request)
    token_resp = http_requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": config.GOOGLE_CLIENT_ID,
            "client_secret": config.GOOGLE_CLIENT_SECRET,
            "redirect_uri": f"{base}/api/auth/oauth/google/callback",
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    if not token_resp.ok:
        return redirect(f"{config.FRONTEND_URL}/auth/login?error=token_exchange_failed")

    tokens = token_resp.json()
    access_token = tokens.get("access_token")

    userinfo = http_requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    ).json()

    user = _upsert_oauth_user(
        email=userinfo.get("email"),
        name=userinfo.get("name", userinfo.get("email", "User")),
        avatar_url=userinfo.get("picture"),
        provider="google",
    )

    token = create_token(user["id"])
    resp = redirect(f"{config.FRONTEND_URL}/dashboard")
    resp.set_cookie(
        "access_token", token,
        httponly=True, samesite="Lax",
        max_age=7 * 86400,
        secure=not config.DEBUG,
    )
    return resp


# ── GitHub OAuth ──────────────────────────────────────────────
@auth_bp.get("/oauth/github")
def github_login():
    base = _base_url(request)
    params = urlencode({
        "client_id": config.GITHUB_CLIENT_ID,
        "redirect_uri": f"{base}/api/auth/oauth/github/callback",
        "scope": "user:email",
    })
    return redirect(f"https://github.com/login/oauth/authorize?{params}")


@auth_bp.get("/oauth/github/callback")
def github_callback():
    code = request.args.get("code")
    error = request.args.get("error")
    if error or not code:
        return redirect(f"{config.FRONTEND_URL}/auth/login?error=oauth_denied")

    base = _base_url(request)
    token_resp = http_requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": config.GITHUB_CLIENT_ID,
            "client_secret": config.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": f"{base}/api/auth/oauth/github/callback",
        },
        timeout=10,
    )
    tokens = token_resp.json()
    access_token = tokens.get("access_token")
    if not access_token:
        return redirect(f"{config.FRONTEND_URL}/auth/login?error=token_exchange_failed")

    user_resp = http_requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    ).json()

    email = user_resp.get("email")
    if not email:
        emails_resp = http_requests.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        ).json()
        email = next(
            (e["email"] for e in emails_resp if e.get("primary") and e.get("verified")),
            None,
        )

    if not email:
        return redirect(f"{config.FRONTEND_URL}/auth/login?error=no_email")

    user = _upsert_oauth_user(
        email=email,
        name=user_resp.get("name") or user_resp.get("login") or email,
        avatar_url=user_resp.get("avatar_url"),
        provider="github",
    )

    token = create_token(user["id"])
    resp = redirect(f"{config.FRONTEND_URL}/dashboard")
    resp.set_cookie(
        "access_token", token,
        httponly=True, samesite="Lax",
        max_age=7 * 86400,
        secure=not config.DEBUG,
    )
    return resp


def _upsert_oauth_user(email: str, name: str, avatar_url: str | None, provider: str) -> dict:
    existing = UserModel.get_by_email(email)
    is_first_user = not existing

    now = datetime.now(timezone.utc).isoformat()
    user_data = {
        "email": email,
        "name": name,
        "avatar_url": avatar_url,
        "provider": provider,
        "role": "admin" if is_first_user else (existing or {}).get("role", "user"),
        "updated_at": now,
    }
    if not existing:
        user_data["id"] = str(uuid.uuid4())
        user_data["created_at"] = now

    return UserModel.upsert(user_data)


@auth_bp.get("/me")
@require_auth
def me():
    return jsonify({"success": True, "data": g.user})


@auth_bp.post("/logout")
def logout():
    resp = jsonify({"success": True, "message": "Logged out"})
    resp.delete_cookie("access_token", samesite="Lax")
    return resp
