"""Security headers and production secret validation."""
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

IS_PRODUCTION = os.environ.get("ENV", "").lower() == "production"
DEV_JWT_SECRET = "cvpm-jwt-secret-change-in-production-2026"
DEV_ADMIN_PASSWORD = "cvpm-admin-2026"

CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://us.i.posthog.com https://us-assets.i.posthog.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: blob: https:; "
    "connect-src 'self' https://api.stripe.com https://us.i.posthog.com https://booking.guesty.com wss: ws:; "
    "frame-src https://js.stripe.com; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)


def validate_production_secrets():
    if not IS_PRODUCTION:
        return
    jwt = os.environ.get("JWT_SECRET", "")
    admin = os.environ.get("ADMIN_PASSWORD", "")
    if not jwt or jwt == DEV_JWT_SECRET:
        raise RuntimeError("JWT_SECRET must be set to a strong value in production")
    if not admin or admin == DEV_ADMIN_PASSWORD:
        raise RuntimeError("ADMIN_PASSWORD must be set to a strong value in production")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = CSP
        if IS_PRODUCTION:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
