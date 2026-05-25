"""Tests for task endpoints."""
import pytest
import jwt
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta
from app import create_app
from config import config


MOCK_ADMIN = {
    "id": "admin-001",
    "email": "admin@test.com",
    "name": "Admin",
    "role": "admin",
    "created_at": datetime.now(timezone.utc).isoformat(),
}

MOCK_USER = {
    "id": "user-001",
    "email": "user@test.com",
    "name": "User",
    "role": "user",
    "created_at": datetime.now(timezone.utc).isoformat(),
}


def make_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        config.JWT_SECRET,
        algorithm="HS256",
    )


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@patch("middleware.auth.UserModel")
def test_list_tasks_requires_admin(mock_um, client):
    mock_um.get_by_id.return_value = MOCK_USER
    mock_um.update_last_active.return_value = None
    token = make_token(MOCK_USER["id"])
    res = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


@patch("middleware.auth.UserModel")
@patch("api.tasks.routes.TaskModel")
def test_list_tasks_admin_ok(mock_tm, mock_um, client):
    mock_um.get_by_id.return_value = MOCK_ADMIN
    mock_um.update_last_active.return_value = None
    mock_tm.get_all.return_value = ([], 0)
    token = make_token(MOCK_ADMIN["id"])
    res = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
