"""
Vercel serverless entrypoint — /api

Adds backend/ to sys.path and re-exports the FastAPI app.
Vercel passes all /api/* requests to this ASGI handler via the
rewrite rule in vercel.json: /api/(.*) → /api
"""
import sys
import os
from pathlib import Path

_BACKEND = Path(__file__).resolve().parent.parent / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

os.environ.setdefault("VERCEL", "1")

from server import app  # noqa: E402
