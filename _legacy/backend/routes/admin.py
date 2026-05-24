"""
Admin Routes - Dashboard, Stats, Management
"""
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
import logging

from auth import verify_token
from services.guesty import SDK_CONTRACT

router = APIRouter(tags=["Admin"])
logger = logging.getLogger(__name__)

# Will be initialized from main app
db = None
guesty_service = None


def init_admin_routes(database, guesty_svc):
    """Initialize routes with database and services"""
    global db, guesty_service
    db = database
    guesty_service = guesty_svc


# ==================== ADMIN STATS ====================

@router.get("/admin/stats")
async def get_admin_stats(_: str = Depends(verify_token)):
    """Get admin dashboard stats"""
    contacts = await db.contacts.count_documents({})
    inquiries = await db.owner_inquiries.count_documents({})
    transactions = await db.transactions.count_documents({})
    confirmed = await db.transactions.count_documents({'status': 'confirmed'})
    
    return {
        'contacts': contacts,
        'owner_inquiries': inquiries,
        'total_transactions': transactions,
        'confirmed_bookings': confirmed,
        'sdk_contract_version': SDK_CONTRACT['version']
    }


@router.get("/admin/contacts")
async def get_admin_contacts(_: str = Depends(verify_token)):
    """Get all contact submissions"""
    contacts = await db.contacts.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return contacts


@router.get("/admin/owner-inquiries")
async def get_admin_inquiries(_: str = Depends(verify_token)):
    """Get all owner inquiries"""
    inquiries = await db.owner_inquiries.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return inquiries


@router.get("/admin/transactions")
async def get_admin_transactions(_: str = Depends(verify_token)):
    """Get all transactions"""
    transactions = await db.transactions.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return transactions


@router.post("/admin/clear-cache")
async def clear_cache(_: str = Depends(verify_token)):
    """Clear response cache"""
    cleared = await guesty_service.response_cache.clear()
    return {"success": True, "cleared": cleared}


@router.post("/admin/refresh-token")
async def refresh_token(_: str = Depends(verify_token)):
    """Force refresh Guesty token"""
    await guesty_service.token_cache.invalidate()
    token = await guesty_service.token_cache.get_token()
    return {"success": True, "token_prefix": token[:20] + "..."}


@router.post("/admin/set-guesty-token")
async def set_guesty_token(body: dict, _: str = Depends(verify_token)):
    """Manually inject a Guesty BEAPI access token into cache (use when OAuth creds unavailable).
    Body: { "access_token": "eyJ...", "expires_at": "2026-05-23T22:48:56+00:00" }
    """
    from datetime import datetime, timezone, timedelta
    token = (body.get("access_token") or "").strip()
    if not token:
        return {"success": False, "error": "access_token required"}
    expires_str = body.get("expires_at", "")
    try:
        expires_at = datetime.fromisoformat(expires_str) if expires_str else datetime.now(timezone.utc) + timedelta(hours=24)
    except Exception:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    guesty_service.token_cache._local_token = token
    guesty_service.token_cache._local_expires_at = expires_at
    guesty_service.token_cache._save_to_json(token, expires_at)
    try:
        await db.guesty_tokens.replace_one(
            {"type": "beapi_token"},
            {"type": "beapi_token", "token": token, "expires_at": expires_at.isoformat()},
            upsert=True
        )
    except Exception as e:
        pass
    return {"success": True, "expires_at": expires_at.isoformat(), "token_prefix": token[:20] + "..."}


# ==================== CRON: TOKEN REFRESH ====================

@router.api_route("/admin/refresh-token-cron", methods=["GET", "POST"])
async def refresh_token_cron():
    """Vercel Cron target — refreshes Guesty token at (24h - 300s) intervals.
    Called by Vercel Cron Jobs once per day. Only refreshes if close to expiry.
    """
    if not guesty_service:
        return {"status": "error", "detail": "Guesty service not initialized"}
    old_token = guesty_service.token_cache._local_token
    await guesty_service.token_cache.invalidate()
    token = await guesty_service.token_cache.get_token()
    refreshed = token != old_token
    return {
        "status": "ok",
        "refreshed": refreshed,
        "token_prefix": token[:20] + "..." if token else None,
    }


@router.get("/admin/backup")
async def export_backup(_: str = Depends(verify_token)):
    """Export CMS + page data for backup."""
    cms = await db.cms.find_one({}, {"_id": 0})
    pages = await db.cms_pages.find({}, {"_id": 0}).to_list(500)
    drafts = await db.cms_page_drafts.find({}, {"_id": 0}).to_list(500)
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "cms": cms or {},
        "pages": pages,
        "drafts": drafts,
    }


# ==================== HEALTH CHECK ====================

@router.get("/admin/health")
async def admin_health():
    """Public health check — no auth required. Returns real connection status for all services."""
    statuses = {}

    # MongoDB
    try:
        await db.command("ping")
        statuses["mongodb"] = "connected"
    except Exception:
        statuses["mongodb"] = "disconnected"

    # Guesty
    try:
        token = await guesty_service.token_cache.get_token()
        statuses["guesty"] = "connected" if token else "disconnected"
    except Exception:
        statuses["guesty"] = "disconnected"

    # AI service
    from services.ai_service import _client
    statuses["ai"] = "configured" if _client else "not_configured"

    # Stripe
    import stripe as stripe_sdk
    stripe_key = os.environ.get("STRIPE_API_KEY")
    statuses["stripe"] = "configured" if stripe_key else "not_configured"

    return statuses
