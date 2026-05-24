"""
Contact Routes - Contact Forms, Inquiries
"""
from pathlib import Path
from fastapi import APIRouter, Request
from limiter import limiter
from datetime import datetime, timezone
import uuid

from models.schemas import ContactRequest, PropertyOwnerInquiry

router = APIRouter(tags=["Contact"])

# Will be initialized from main app
db = None


def init_contact_routes(database):
    """Initialize routes with database"""
    global db
    db = database


def _format_contact_email(data: dict) -> str:
    template_path = Path(__file__).resolve().parent.parent / "templates" / "contact_notification.txt"
    try:
        tpl = template_path.read_text()
        return tpl.format(**{k: data.get(k, "") for k in ("name", "email", "phone", "subject", "message", "created_at")})
    except Exception:
        return f"Contact from {data.get('name')}: {data.get('message')}"


@router.post("/contact")
@limiter.limit("5/minute")
async def submit_contact(http_request: Request, request: ContactRequest):
    """Submit contact form"""
    created = datetime.now(timezone.utc).isoformat()
    doc = {
        'id': str(uuid.uuid4()),
        **request.model_dump(),
        'created_at': created,
        'status': 'new',
        'email_body': _format_contact_email({**request.model_dump(), 'created_at': created}),
    }
    await db.contacts.insert_one(doc)
    return {"success": True}


@router.post("/property-owner-inquiry")
@limiter.limit("5/minute")
async def submit_owner_inquiry(http_request: Request, request: PropertyOwnerInquiry):
    """Submit property owner inquiry"""
    await db.owner_inquiries.insert_one({
        'id': str(uuid.uuid4()),
        **request.model_dump(),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'status': 'new'
    })
    return {"success": True}
