"""
CVPM Booking Platform API - Modular Backend Architecture
Christiano Vincenti Property Management

This is the main entry point that composes all route modules.
"""
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
import asyncio
import os
import logging
from pathlib import Path
from datetime import datetime, timezone

# Load environment (Vercel CLI: vercel env pull .env.local)
ROOT_DIR = Path(__file__).parent
REPO_ROOT = ROOT_DIR.parent
load_dotenv(REPO_ROOT / '.env.local')
load_dotenv(REPO_ROOT / '.env')
load_dotenv(ROOT_DIR / '.env')

from env_bootstrap import apply_env_aliases
apply_env_aliases()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Import services
from services.guesty import GuestyService

# Import routes
from routes.booking import router as booking_router, init_booking_routes
from routes.cms import router as cms_router, init_cms_routes
from routes.admin import router as admin_router, init_admin_routes
from routes.auth import router as auth_router
from routes.contact import router as contact_router, init_contact_routes
from routes.media import router as media_router
from routes.websocket import sio, get_socket_app
from routes.sitemap import router as sitemap_router, init_sitemap_routes
from middleware.security import SecurityHeadersMiddleware, validate_production_secrets

validate_production_secrets()

# Initialize services
guesty_service = GuestyService(db)

# Initialize route dependencies
init_booking_routes(db, guesty_service)
init_cms_routes(db)
init_admin_routes(db, guesty_service)
init_contact_routes(db)
init_sitemap_routes(db, guesty_service)

# Create FastAPI app
app = FastAPI(
    title="CVPM Booking Platform API",
    description="Christiano Vincenti Property Management - Modular Backend",
    version="3.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ==================== STRIPE WEBHOOK ====================
# Kept in main file due to raw body requirement

import stripe as stripe_sdk
from services.guesty import GuestyService

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks — finalise the Guesty reservation on payment success.
    Canonical behaviour:
      - If listing bookingType is 'instantly_bookable' (default) → POST /instant
      - If listing bookingType is 'inquiry' (request-to-book)     → POST /inquiry
    """
    stripe_sdk.api_key = STRIPE_API_KEY
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    try:
        event = stripe_sdk.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
    except stripe_sdk.error.SignatureVerificationError:
        return {"status": "invalid_signature"}
    except Exception as e:
        logger.error(f"Webhook parse error: {e}")
        return {"status": "error"}

    try:
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            session_id = session['id']
            payment_status = session.get('payment_status', '')
            metadata = session.get('metadata', {})

            if payment_status == 'paid':
                tx = await db.transactions.find_one({'session_id': session_id})
                if tx and not tx.get('reservation_id'):
                    rate_plan_id = metadata.get('rate_plan_id')
                    json_payload = {'ratePlanId': rate_plan_id} if rate_plan_id else None

                    booking_endpoint = 'instant'
                    try:
                        listing = await guesty_service.request(
                            'GET', f'/listings/{tx["listing_id"]}', use_cache=True
                        )
                        if (listing.get('bookingType') or '').lower() == 'inquiry':
                            booking_endpoint = 'inquiry'
                    except Exception as e:
                        logger.warning(f"Could not detect bookingType, defaulting to instant: {e}")

                    try:
                        reservation = await guesty_service.request(
                            'POST',
                            f'/reservations/quotes/{tx["quote_id"]}/{booking_endpoint}',
                            json_data=json_payload
                        )
                        status = 'confirmed' if booking_endpoint == 'instant' else 'inquiry_submitted'
                        await db.transactions.update_one(
                            {'session_id': session_id},
                            {'$set': {
                                'status': status,
                                'booking_type': booking_endpoint,
                                'reservation_id': reservation.get('_id'),
                                'confirmation_code': reservation.get('confirmationCode'),
                            }}
                        )
                    except Exception as e:
                        logger.error(f"Reservation creation failed ({booking_endpoint}): {e}")
                        await db.transactions.update_one(
                            {'session_id': session_id},
                            {'$set': {'status': 'payment_received_booking_failed', 'error': str(e)}}
                        )

        return {"status": "received"}
    except Exception as e:
        logger.error(f"Webhook handler error: {e}")
        return {"status": "error"}

# ==================== HEALTH & ROOT ====================

@app.get("/api/")
async def root():
    return {
        "message": "CVPM Booking Platform API",
        "version": "3.0.0",
        "architecture": "modular",
        "modules": ["booking", "cms", "admin", "contact", "media", "websocket"]
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ==================== INCLUDE ROUTERS ====================

app.include_router(booking_router, prefix="/api")
app.include_router(cms_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(media_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(sitemap_router, prefix="/api")

# ==================== WEBSOCKET MOUNTING ====================

# Mount Socket.IO at /ws path
socket_app = get_socket_app()
app.mount("/ws", socket_app)

# ==================== CORS ====================

CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '')
if CORS_ORIGINS:
    origins = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
else:
    origins = [
        'https://www.christianopropertymanagement.com',
        'https://christianopropertymanagement.com',
        'http://localhost:5173',
        'http://localhost:3000',
    ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.add_middleware(SecurityHeadersMiddleware)

# ==================== STARTUP / SHUTDOWN ====================

@app.on_event("startup")
async def startup():
    """Create indexes + start background Guesty token refresh"""
    await db.transactions.create_index("session_id", unique=True)
    await db.response_cache.create_index("key", unique=True)
    await db.response_cache.create_index("expires_at", expireAfterSeconds=0)
    await db.cms_pages.create_index("slug", unique=True)
    await db.cms_page_drafts.create_index("slug", unique=True)
    logger.info("Indexes created - Modular backend v3.0.0 started")

    # Pre-fetch Guesty token so first request doesn't wait
    asyncio.ensure_future(guesty_service.token_cache.get_token())
    # Background refresh cycle (runs every 24h - 300s)
    asyncio.ensure_future(guesty_service.token_cache.start_background_refresh())

@app.on_event("shutdown")
async def shutdown():
    client.close()
