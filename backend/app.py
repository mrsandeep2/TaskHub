import os
from flask import Flask, jsonify
from flask_cors import CORS
from middleware.rate_limit import limiter


def create_app() -> Flask:
    app = Flask(__name__)

    # CORS — allow frontend URL and localhost for dev
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    allowed_origins = list({frontend_url, "http://localhost:3000"})
    CORS(
        app,
        supports_credentials=True,
        origins=allowed_origins,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # Rate limiter
    limiter.init_app(app)

    # Blueprints (imported inside to avoid circular imports)
    from api.auth.routes import auth_bp
    from api.tasks.routes import tasks_bp, my_tasks_bp
    from api.ai.routes import ai_bp
    from api.admin.routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(my_tasks_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(admin_bp)

    # Health check
    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "TaskHub API", "env": os.getenv("FLASK_ENV", "production")})

    # Handle preflight OPTIONS for all routes
    @app.before_request
    def handle_options():
        from flask import request, Response
        if request.method == "OPTIONS":
            return Response(status=200)

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Not found"}), 404

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"success": False, "message": "Rate limit exceeded. Please wait."}), 429

    @app.errorhandler(500)
    def server_error(e):
        app.logger.error(f"500 error: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        debug=os.getenv("FLASK_ENV") == "development",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
    )
