"""
Guesty BEAPI Service - Token management, caching, and API requests
Canonical reference: booking-api-docs.guesty.com (audited 2026-05-21)
- OAuth2 client_credentials, scope: booking_engine:api
- Tokens valid 24 h; cache refreshes 300 s before expiry (86400 - 300)
- 429/5xx exponential backoff with jitter (5 req/s, 275/min, 16500/hr, 15 concurrent)
"""
import os
import logging
import asyncio
import hashlib
import json
import random
from datetime import datetime, timezone, timedelta
from typing import Optional  # used in GuestyTokenCache
import httpx
from fastapi import HTTPException

# JSON token file for local persistence (parallel to MongoDB)
# FIXED: Use proper data directory instead of backend root
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
TOKEN_FILE = os.path.join(DATA_DIR, 'guesty-token.json')

logger = logging.getLogger(__name__)

# Guesty BEAPI Configuration
GUESTY_CLIENT_ID = os.environ.get('GUESTY_BEAPI_CLIENT_ID')
GUESTY_CLIENT_SECRET = os.environ.get('GUESTY_BEAPI_CLIENT_SECRET')
GUESTY_TOKEN_URL = "https://booking.guesty.com/oauth2/token"
GUESTY_API_BASE = "https://booking.guesty.com/api"

# Token expires_in = 86400 s (24 h); refresh 300 s early so callers never
# receive a token that expires mid-request.
TOKEN_LIFETIME_SEC = 86400
TOKEN_REFRESH_BUFFER_SEC = 300  # 24 h - 300 s effective cache window

# Rate-limit backoff config (canonical: 5/s, 275/min, 16500/hr, 15 concurrent)
MAX_RETRIES = 3
BASE_BACKOFF_SEC = 0.6  # 0.6 → 1.2 → 2.4 + jitter
MAX_BACKOFF_SEC = 8.0

# SDK Contract - Pinned allowlist of BEAPI endpoints (audited 2026-05-21)
# V1 reservation endpoints were permanently removed 2026-03-31.
# The /api/availability-pricing/api/v3 path does not exist in official docs;
# all endpoints live under /api (GUESTY_API_BASE).
SDK_CONTRACT = {
    "version": "2026-05-21",
    "allowlist": [
        # Listings
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/listings"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/listings/{listingId}"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/listings/{listingId}/calendar"},
        # Quotes
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/reservations/quotes/{quoteId}"},
        {"host": "booking.guesty.com", "method": "PUT", "path": "/api/reservations/quotes/{quoteId}/coupons"},
        {"host": "booking.guesty.com", "method": "DELETE", "path": "/api/reservations/quotes/{quoteId}/coupons/{couponCode}"},
        # Reservations (quote-based, canonical post 2026-03-31)
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes/{quoteId}/instant"},
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes/{quoteId}/inquiry"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/reservations/{reservationId}/details"},
        # Payouts
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/reservations/payouts/list"},
    ]
}

# Error mappings for user-friendly messages
GUESTY_ERROR_MAP = {
    "VALIDATION_ERROR": "Invalid booking details. Please check your dates and try again.",
    "LISTING_NOT_FOUND": "Property not found or no longer available.",
    "QUOTE_EXPIRED": "Your quote has expired. Please select dates again.",
    "UNAVAILABLE": "Selected dates are no longer available.",
    "MIN_NIGHTS": "This property requires a minimum stay.",
    "BOOKING_TYPE_MISMATCH": "This property only accepts booking requests.",
    "LISTING_NOT_AVAILABLE": "This property is not available for the selected dates.",
    "DATES_IN_PAST": "Please select dates in the future.",
    "BUSINESS_RESTRICTION": "This property has booking restrictions for the selected dates.",
    "INVALID_COUPON": "This coupon code is invalid or has expired.",
    "COUPON_NOT_APPLICABLE": "This coupon does not apply to your selected dates or property.",
    "RATE_PLAN_NOT_FOUND": "The selected rate plan is no longer available.",
}


def map_guesty_error(error_text: str, status_code: int) -> dict:
    """Map Guesty errors to user-friendly messages with error codes.
    For unmapped Guesty error codes, we surface Guesty's own message so users
    see something actionable instead of a generic 'unavailable' fallback.
    """
    error_lower = (error_text or "").lower()

    # Parse error JSON if possible (Guesty shape: {"error": {"code": "...", "message": "..."}})
    error_code = "UNKNOWN_ERROR"
    guesty_message = None
    try:
        error_json = json.loads(error_text)
        err_obj = error_json.get("error") if isinstance(error_json, dict) else None
        if err_obj:
            error_code = err_obj.get("code") or "UNKNOWN_ERROR"
            if isinstance(error_code, int):
                error_code = "API_ERROR"
            guesty_message = err_obj.get("message")
    except Exception:
        pass

    # If Guesty returned a known canonical code, prefer that mapping.
    if isinstance(error_code, str) and error_code.upper() in GUESTY_ERROR_MAP:
        code = error_code.upper()
        return {"code": code, "message": GUESTY_ERROR_MAP[code]}

    # Legacy keyword-based fallbacks
    if "past" in error_lower or "checkin" in error_lower and "invalid" in error_lower:
        return {"code": "DATES_IN_PAST", "message": GUESTY_ERROR_MAP["DATES_IN_PAST"]}
    if "listing_is_not_available" in error_lower or "not applicable" in error_lower or "business restriction" in error_lower:
        return {"code": "LISTING_NOT_AVAILABLE", "message": GUESTY_ERROR_MAP["LISTING_NOT_AVAILABLE"]}
    if "quote" in error_lower and "expired" in error_lower:
        return {"code": "QUOTE_EXPIRED", "message": GUESTY_ERROR_MAP["QUOTE_EXPIRED"]}
    if "unavailable" in error_lower:
        return {"code": "UNAVAILABLE", "message": GUESTY_ERROR_MAP["UNAVAILABLE"]}
    if "minimum" in error_lower and "night" in error_lower:
        return {"code": "MIN_NIGHTS", "message": GUESTY_ERROR_MAP["MIN_NIGHTS"]}
    if "inquiry" in error_lower:
        return {"code": "BOOKING_TYPE_MISMATCH", "message": GUESTY_ERROR_MAP["BOOKING_TYPE_MISMATCH"]}
    if status_code == 404:
        return {"code": "LISTING_NOT_FOUND", "message": GUESTY_ERROR_MAP["LISTING_NOT_FOUND"]}
    if status_code == 422:
        return {"code": "VALIDATION_ERROR", "message": GUESTY_ERROR_MAP["VALIDATION_ERROR"]}

    # Last resort: surface Guesty's own message if present, else generic
    fallback_message = guesty_message or "Service temporarily unavailable. Please try again."
    return {"code": error_code, "message": fallback_message}


class GuestyTokenCache:
    """
    Distributed token cache with stampede protection.
    BEAPI tokens use scope: booking_engine:api
    Tokens cached in MongoDB AND local JSON file for persistence across restarts.
    """
    
    def __init__(self, db):
        self.db = db
        self._local_token: Optional[str] = None
        self._local_expires_at: Optional[datetime] = None
        self._lock = asyncio.Lock()
    
    def _load_from_json(self) -> tuple[Optional[str], Optional[datetime]]:
        """Load token from local JSON file"""
        try:
            if os.path.exists(TOKEN_FILE):
                with open(TOKEN_FILE) as f:
                    data = json.load(f)
                if data.get("access_token") and data.get("expires_at"):
                    expires_at = datetime.fromisoformat(data["expires_at"])
                    if datetime.now(timezone.utc) < expires_at - timedelta(seconds=TOKEN_REFRESH_BUFFER_SEC):
                        logger.info("Token loaded from JSON file")
                        return data["access_token"], expires_at
        except Exception as e:
            logger.warning(f"Failed to load token from JSON file: {e}")
        return None, None
    
    def _save_to_json(self, token: str, expires_at: datetime):
        """Save token to local JSON file"""
        try:
            with open(TOKEN_FILE, 'w') as f:
                json.dump({
                    "access_token": token,
                    "expires_at": expires_at.isoformat()
                }, f)
            logger.info("Token persisted to JSON file")
        except Exception as e:
            logger.warning(f"Failed to save token to JSON file: {e}")
    
    async def get_token(self) -> str:
        """Get valid token with cache-first strategy"""
        # Check local cache first
        if self._local_token and self._local_expires_at:
            if datetime.now(timezone.utc) < self._local_expires_at - timedelta(seconds=TOKEN_REFRESH_BUFFER_SEC):
                return self._local_token

        # Check GUESTY_BEAPI_ACCESS_TOKEN env var (allows Vercel to inject token directly)
        env_token = os.environ.get('GUESTY_BEAPI_ACCESS_TOKEN', '').strip()
        if env_token:
            env_expires_str = os.environ.get('GUESTY_BEAPI_TOKEN_EXPIRES', '').strip()
            env_expires = None
            if env_expires_str:
                try:
                    env_expires = datetime.fromisoformat(env_expires_str)
                except Exception:
                    pass
            if not env_expires:
                # No expiry set — treat as valid for 24h from process start
                env_expires = datetime.now(timezone.utc) + timedelta(hours=24)
            if datetime.now(timezone.utc) < env_expires - timedelta(seconds=TOKEN_REFRESH_BUFFER_SEC):
                self._local_token = env_token
                self._local_expires_at = env_expires
                logger.info("Token loaded from GUESTY_BEAPI_ACCESS_TOKEN env var")
                return env_token

        # Check JSON file cache
        json_token, json_expires = self._load_from_json()
        if json_token and json_expires:
            self._local_token = json_token
            self._local_expires_at = json_expires
            return json_token
        
        # Check distributed cache (MongoDB)
        try:
            cached = await self.db.guesty_tokens.find_one({"type": "beapi_token"}, {"_id": 0})
            if cached:
                expires_at = datetime.fromisoformat(cached["expires_at"])
                if datetime.now(timezone.utc) < expires_at - timedelta(seconds=TOKEN_REFRESH_BUFFER_SEC):
                    self._local_token = cached["token"]
                    self._local_expires_at = expires_at
                    self._save_to_json(cached["token"], expires_at)
                    logger.info("Token loaded from MongoDB cache")
                    return cached["token"]
        except Exception as e:
            logger.warning(f"MongoDB cache unavailable, falling back: {e}")
        
        # Acquire new token with lock (stampede protection)
        async with self._lock:
            # Double-check after acquiring lock
            if self._local_token and self._local_expires_at:
                if datetime.now(timezone.utc) < self._local_expires_at - timedelta(seconds=TOKEN_REFRESH_BUFFER_SEC):
                    return self._local_token
            
            return await self._fetch_new_token()
    
    async def _fetch_new_token(self) -> str:
        """Fetch new OAuth2 token from Guesty BEAPI"""
        async with httpx.AsyncClient() as http_client:
            for attempt in range(3):
                try:
                    response = await http_client.post(
                        GUESTY_TOKEN_URL,
                        data={
                            'grant_type': 'client_credentials',
                            'scope': 'booking_engine:api',
                            'client_id': GUESTY_CLIENT_ID,
                            'client_secret': GUESTY_CLIENT_SECRET
                        },
                        headers={
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code == 429:
                        wait_time = (2 ** attempt) * 10
                        logger.warning(f"Rate limited, waiting {wait_time}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    response.raise_for_status()
                    data = response.json()
                    
                    self._local_token = data['access_token']
                    expires_in = data.get('expires_in', TOKEN_LIFETIME_SEC)
                    self._local_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                    
                    # Persist to JSON file
                    self._save_to_json(self._local_token, self._local_expires_at)
                    
                    # Store in distributed cache
                    await self.db.guesty_tokens.update_one(
                        {"type": "beapi_token"},
                        {"$set": {
                            "token": self._local_token,
                            "expires_at": self._local_expires_at.isoformat(),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }},
                        upsert=True
                    )
                    
                    logger.info(f"New BEAPI token acquired, expires at {self._local_expires_at}")
                    return self._local_token
                    
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429 and attempt < 2:
                        continue
                    logger.error(f"Token fetch failed: {e.response.text}")
                    raise HTTPException(status_code=503, detail="Guesty authentication temporarily unavailable")
                except Exception as e:
                    logger.error(f"Token error: {str(e)}")
                    raise HTTPException(status_code=503, detail="Guesty service error")
        
        raise HTTPException(status_code=503, detail="Failed to acquire Guesty token after retries")
    
    async def start_background_refresh(self):
        """Start background task to refresh token before expiry.
        Refreshes at (24h - 300s) intervals so the token is always valid.
        The CRON endpoint POST /api/admin/refresh-token-cron calls this too.
        """
        while True:
            try:
                await self.get_token()
                logger.info("Background token refresh cycle complete")
            except Exception as e:
                logger.error(f"Background token refresh failed: {e}")

            await asyncio.sleep(TOKEN_LIFETIME_SEC - TOKEN_REFRESH_BUFFER_SEC)

    async def invalidate(self):
        """Invalidate cached token"""
        await self.db.guesty_tokens.delete_many({})
        self._local_token = None
        self._local_expires_at = None
        try:
            if os.path.exists(TOKEN_FILE):
                os.remove(TOKEN_FILE)
                logger.info("JSON token file deleted")
        except Exception as e:
            logger.warning(f"Failed to delete JSON token file: {e}")


class ResponseCache:
    """Cache for read-only BEAPI responses (listings only, not user-specific)"""
    
    CACHE_TTL = 300  # 5 minutes
    
    def __init__(self, db):
        self.db = db
    
    def _cache_key(self, endpoint: str, params: dict) -> str:
        """Generate cache key from endpoint + params"""
        param_str = json.dumps(sorted(params.items()), default=str)
        return hashlib.md5(f"{endpoint}:{param_str}".encode()).hexdigest()
    
    async def get(self, endpoint: str, params: dict) -> Optional[dict]:
        """Get cached response if valid"""
        key = self._cache_key(endpoint, params)
        cached = await self.db.response_cache.find_one({"key": key}, {"_id": 0})
        if cached:
            expires_at = datetime.fromisoformat(cached["expires_at"])
            if datetime.now(timezone.utc) < expires_at:
                logger.debug(f"Cache hit for {endpoint}")
                return cached["data"]
        return None
    
    async def set(self, endpoint: str, params: dict, data: dict):
        """Cache response"""
        key = self._cache_key(endpoint, params)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=self.CACHE_TTL)
        await self.db.response_cache.update_one(
            {"key": key},
            {"$set": {
                "key": key,
                "endpoint": endpoint,
                "data": data,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    
    async def clear(self):
        """Clear all cached responses"""
        result = await self.db.response_cache.delete_many({})
        return result.deleted_count


class GuestyService:
    """Main Guesty API service"""
    
    def __init__(self, db):
        self.db = db
        self.token_cache = GuestyTokenCache(db)
        self.response_cache = ResponseCache(db)
    
    async def request(
        self,
        method: str,
        endpoint: str,
        params: dict = None,
        json_data: dict = None,
        use_cache: bool = False,
    ) -> dict:
        """Make authenticated request to Guesty BEAPI with retry/backoff + caching."""
        # Check cache for GET requests on listings
        if use_cache and method == "GET" and "/listings" in endpoint:
            cached = await self.response_cache.get(endpoint, params or {})
            if cached:
                return cached

        token = await self.token_cache.get_token()
        url = f"{GUESTY_API_BASE}{endpoint}"
        last_error_text = ""
        last_status = 0

        async with httpx.AsyncClient() as http_client:
            for attempt in range(MAX_RETRIES + 1):
                try:
                    response = await http_client.request(
                        method=method,
                        url=url,
                        params=params,
                        json=json_data,
                        headers={
                            'Authorization': f'Bearer {token}',
                            'Accept': 'application/json; charset=utf-8',
                            'Content-Type': 'application/json'
                        },
                        timeout=60.0
                    )

                    # Retry on 429 (rate limit) or 5xx (transient)
                    if response.status_code == 429 or 500 <= response.status_code < 600:
                        last_error_text = response.text[:200]
                        last_status = response.status_code
                        if attempt < MAX_RETRIES:
                            retry_after = response.headers.get("Retry-After")
                            if retry_after and retry_after.isdigit():
                                delay = min(int(retry_after), MAX_BACKOFF_SEC)
                            else:
                                delay = min(BASE_BACKOFF_SEC * (2 ** attempt), MAX_BACKOFF_SEC)
                            delay += random.uniform(0, 0.3)  # jitter
                            logger.warning(
                                f"Guesty {method} {endpoint} -> {response.status_code}, "
                                f"retrying in {delay:.2f}s (attempt {attempt + 1}/{MAX_RETRIES})"
                            )
                            await asyncio.sleep(delay)
                            continue

                    response.raise_for_status()
                    data = response.json()

                    if use_cache and method == "GET" and "/listings" in endpoint:
                        await self.response_cache.set(endpoint, params or {}, data)

                    return data

                except httpx.HTTPStatusError as e:
                    logger.error(f"Guesty API {method} {endpoint}: {e.response.status_code} - {e.response.text[:200]}")
                    error_info = map_guesty_error(e.response.text, e.response.status_code)
                    raise HTTPException(status_code=e.response.status_code, detail=error_info)
                except httpx.HTTPError as e:
                    last_error_text = str(e)
                    if attempt < MAX_RETRIES:
                        delay = min(BASE_BACKOFF_SEC * (2 ** attempt), MAX_BACKOFF_SEC) + random.uniform(0, 0.3)
                        logger.warning(f"Guesty network error on {endpoint}: {e}, retry in {delay:.2f}s")
                        await asyncio.sleep(delay)
                        continue
                    logger.error(f"Guesty request error after retries: {e}")
                    raise HTTPException(
                        status_code=503,
                        detail={"code": "SERVICE_ERROR", "message": "Service temporarily unavailable"}
                    )

        # All retries exhausted on 429/5xx
        logger.error(f"Guesty {method} {endpoint} exhausted retries: {last_status} {last_error_text}")
        error_info = map_guesty_error(last_error_text, last_status)
        raise HTTPException(status_code=last_status or 503, detail=error_info)


