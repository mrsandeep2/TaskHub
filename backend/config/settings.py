import os
from dotenv import load_dotenv

load_dotenv()

def _require(key: str) -> str:
    val = os.getenv(key)
    if not val:
        raise RuntimeError(
            f"Missing required environment variable: {key}\n"
            f"See .env.example for setup instructions."
        )
    return val

class Config:
    SUPABASE_URL: str = _require("SUPABASE_URL")
    SUPABASE_SERVICE_KEY: str = _require("SUPABASE_SERVICE_KEY")
    SUPABASE_ANON_KEY: str = _require("SUPABASE_ANON_KEY")
    JWT_SECRET: str = _require("JWT_SECRET")

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@taskhub.app")

    STABILITY_API_KEY: str = os.getenv("STABILITY_API_KEY", "")
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "")

    AI_RATE_LIMIT: str = "10/hour"
    API_RATE_LIMIT: str = "100/minute"
    DEBUG: bool = os.getenv("FLASK_ENV") == "development"

config = Config()
