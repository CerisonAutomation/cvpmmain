"""
Auth Routes — JWT login endpoint
"""
import os
import logging
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Request
from limiter import limiter

from auth import create_token

router = APIRouter(tags=["Auth"])
logger = logging.getLogger(__name__)

_IS_PROD = os.environ.get("ENV", "").lower() == "production"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") or (
    "" if _IS_PROD else "cvpm-admin-2026"
)


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


@router.post("/auth/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def admin_login(request: Request, req: LoginRequest):
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Admin login not configured")
    if req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_token("admin")
    return LoginResponse(token=token, username="admin")
