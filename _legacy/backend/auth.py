"""
JWT Authentication for Admin Routes
"""
import os
import logging
from datetime import datetime, timezone, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

try:
    import jwt as pyjwt
except ImportError:
    pyjwt = None

logger = logging.getLogger(__name__)

_IS_PROD = os.environ.get("ENV", "").lower() == "production"
JWT_SECRET = os.environ.get("JWT_SECRET") or (
    "" if _IS_PROD else "cvpm-jwt-secret-change-in-production-2026"
)
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

security = HTTPBearer(auto_error=False)


def create_token(username: str) -> str:
    if not pyjwt:
        raise HTTPException(status_code=500, detail="JWT library not installed")
    payload = {
        "sub": username,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def verify_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str:
    if not JWT_SECRET:
        raise HTTPException(status_code=503, detail="JWT not configured")
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required — provide Bearer token in Authorization header",
        )
    if not pyjwt:
        raise HTTPException(status_code=500, detail="JWT library not installed")
    token = credentials.credentials
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub", "unknown")
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired — login again")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
