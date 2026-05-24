"""
Booking Routes - Listings, Quotes, Reservations
All pricing flows through Guesty BEAPI — no hardcoded fees, taxes or add-ons.
"""
from fastapi import APIRouter, Query, Request, HTTPException
from typing import Optional
import uuid
import logging
from datetime import datetime, timezone
import os

from models.schemas import (
    QuoteRequest, CouponRequest, CheckoutRequest, PaymentIntentRequest,
    FinalizeReservationRequest, InstantReservationRequest, InquiryReservationRequest,
)
from services.guesty import GuestyService, SDK_CONTRACT
import stripe as stripe_sdk

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Booking"])

# Will be initialized from main app
guesty_service: GuestyService = None
db = None

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')


def init_booking_routes(database, guesty_svc: GuestyService):
    """Initialize routes with database and services"""
    global db, guesty_service
    db = database
    guesty_service = guesty_svc


# ==================== SDK CONTRACT ====================

@router.get("/sdk-contract")
async def get_sdk_contract():
    """Return the SDK contract (allowlist of supported endpoints)"""
    return SDK_CONTRACT


# ==================== LISTINGS ====================

@router.get("/listings/cities")
async def get_cities():
    """Get list of cities that have available listings (Guesty BEAPI)."""
    return await guesty_service.request('GET', '/listings/cities', use_cache=True)


@router.get("/listings")
async def get_listings(
    checkIn: Optional[str] = None,
    checkOut: Optional[str] = None,
    # Simple total guest count
    guests: Optional[int] = None,
    # Detailed guest breakdown (sent individually so callers don't need to JSON-encode)
    adults: Optional[int] = None,
    children: Optional[int] = None,
    infants: Optional[int] = None,
    pets: Optional[int] = None,
    # Filters
    city: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    bedrooms: Optional[int] = Query(None, alias="numberOfBedrooms"),
    bathrooms: Optional[int] = Query(None, alias="numberOfBathrooms"),
    amenities: Optional[str] = None,  # comma-separated amenity slugs
    tags: Optional[str] = None,
    # Response shaping
    fields: Optional[str] = None,  # e.g. "totalPrice _id address city"
    limit: int = 20,
    cursor: Optional[str] = None,
):
    """Search listings from Guesty BEAPI.

    Pass checkIn + checkOut to get totalPrice in the response (Guesty computes
    it via the quote engine internally). Max 50 results, no pagination cursor.
    """
    params: dict = {'limit': min(limit, 50)}

    if checkIn: params['checkIn'] = checkIn
    if checkOut: params['checkOut'] = checkOut

    # Guesty uses minOccupancy for the headline count
    if guests: params['minOccupancy'] = guests

    # Detailed breakdown — Guesty accepts numberOfGuests[adults] etc. as separate params
    if adults is not None: params['numberOfGuests[adults]'] = adults
    if children is not None: params['numberOfGuests[children]'] = children
    if infants is not None: params['numberOfGuests[infants]'] = infants
    if pets is not None: params['numberOfGuests[pets]'] = pets

    if city: params['city'] = city
    if minPrice: params['minPrice'] = minPrice
    if maxPrice: params['maxPrice'] = maxPrice
    if bedrooms: params['numberOfBedrooms'] = bedrooms
    if bathrooms: params['numberOfBathrooms'] = bathrooms
    if amenities: params['amenities'] = amenities
    if tags: params['tags'] = tags
    if cursor: params['cursor'] = cursor

    # Always request totalPrice when dates are provided
    base_fields = 'totalPrice _id address city title pictures bedrooms bathrooms accommodates'
    params['fields'] = fields if fields else base_fields

    return await guesty_service.request('GET', '/listings', params=params, use_cache=True)


@router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Fetch single listing by ID. Per Guesty BEAPI, /listings/{id} does not
    accept checkIn/checkOut params (those are valid only on /listings search)."""
    return await guesty_service.request('GET', f'/listings/{listing_id}', use_cache=True)


@router.get("/listings/{listing_id}/calendar")
async def get_listing_calendar(
    listing_id: str,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None
):
    """Fetch listing calendar/availability
    
    BEAPI requires 'from' and 'to' query params (dates in YYYY-MM-DD format)
    Frontend sends startDate/endDate, we map to from/to
    """
    from datetime import datetime, timedelta
    
    # Default: today + 6 months if no dates provided
    if not startDate:
        startDate = datetime.now().strftime("%Y-%m-%d")
    if not endDate:
        endDate = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
    
    params = {
        'from': startDate,
        'to': endDate
    }
    
    return await guesty_service.request('GET', f'/listings/{listing_id}/calendar', params=params, use_cache=True)


# ==================== QUOTES ====================

@router.post("/quotes")
async def create_quote(request: QuoteRequest):
    """Create a Guesty reservation quote.

    guestsCount is the required headline total; numberOfGuests provides the
    optional adult/child/infant/pet breakdown. coupons is a comma-separated
    string of coupon codes (Guesty BEAPI canonical format).
    """
    payload = {
        'listingId': request.listingId,
        'checkInDateLocalized': request.checkInDateLocalized,
        'checkOutDateLocalized': request.checkOutDateLocalized,
        'guestsCount': request.guestsCount,
    }
    if request.numberOfGuests:
        payload['numberOfGuests'] = request.numberOfGuests.model_dump(exclude_none=False)
    if request.guest:
        payload['guest'] = request.guest.model_dump()
    if request.coupons:
        payload['coupons'] = request.coupons  # already a comma-separated string

    return await guesty_service.request('POST', '/reservations/quotes', json_data=payload)


@router.get("/quotes/{quote_id}")
async def get_quote(quote_id: str):
    """Get quote details"""
    return await guesty_service.request('GET', f'/reservations/quotes/{quote_id}')


@router.put("/quotes/{quote_id}/coupons")
async def update_quote_coupons(quote_id: str, request: CouponRequest):
    """Apply coupon code(s) to quote — Guesty BEAPI canonical: PUT with coupons string."""
    return await guesty_service.request(
        'PUT',
        f'/reservations/quotes/{quote_id}/coupons',
        json_data={'coupons': request.coupons}
    )


@router.delete("/quotes/{quote_id}/coupons/{coupon_code}")
async def remove_quote_coupon(quote_id: str, coupon_code: str):
    """Remove a coupon from a quote — Guesty BEAPI canonical endpoint."""
    return await guesty_service.request(
        'DELETE',
        f'/reservations/quotes/{quote_id}/coupons/{coupon_code}'
    )


# ==================== RESERVATIONS ====================

@router.post("/reservations/instant/{quote_id}")
async def create_instant_reservation(quote_id: str, request: InstantReservationRequest):
    """Create instant (confirmed) reservation from a Guesty quote.

    Requires a Stripe SCA token (pm_...) as ccToken.
    Reservation status will be 'Confirmed'.
    """
    payload = {
        'ratePlanId': request.ratePlanId,
        'ccToken': request.ccToken,
        'guest': request.guest.model_dump(),
    }
    if request.policy:
        payload['policy'] = request.policy
    return await guesty_service.request('POST', f'/reservations/quotes/{quote_id}/instant', json_data=payload)


@router.post("/reservations/inquiry/{quote_id}")
async def create_inquiry_reservation(quote_id: str, request: InquiryReservationRequest):
    """Create an inquiry/booking-request reservation from a Guesty quote.

    ccToken is optional for inquiries. reservedUntil is hours to hold the
    reservation (-1 = indefinite; allowed: -1, 12, 24, 36, 48, 72).
    Reservation status will be 'Reserved'.
    """
    payload = {
        'ratePlanId': request.ratePlanId,
        'guest': request.guest.model_dump(),
        'reservedUntil': request.reservedUntil,
    }
    if request.ccToken:
        payload['ccToken'] = request.ccToken
    if request.policy:
        payload['policy'] = request.policy
    return await guesty_service.request('POST', f'/reservations/quotes/{quote_id}/inquiry', json_data=payload)


@router.get("/reservations/{reservation_id}/details")
async def get_reservation_details(reservation_id: str):
    """Get reservation details"""
    return await guesty_service.request('GET', f'/reservations/{reservation_id}/details')


@router.get("/payouts/schedule")
async def get_payouts_schedule(
    listingId: str,
    checkIn: str,
    checkOut: str,
    total: float,
    bookingType: str = "instant",
):
    """Retrieve the payment schedule (payout dates/amounts) for a prospective stay."""
    params = {
        'listingId': listingId,
        'checkIn': checkIn,
        'checkOut': checkOut,
        'total': total,
        'bookingType': bookingType,
    }
    return await guesty_service.request('GET', '/reservations/payouts/list', params=params)


# ==================== CHECKOUT / STRIPE ====================

def extract_pricing(quote: dict, rate_plan_id: Optional[str] = None) -> dict:
    """Extract correct guest-facing total from quote"""
    rate_plans = quote.get('rates', {}).get('ratePlans', [])
    if not rate_plans:
        raise HTTPException(status_code=400, detail="No rate plans available")
    
    selected = rate_plans[0]
    if rate_plan_id:
        for plan in rate_plans:
            rp = plan.get('ratePlan', {})
            if rp.get('_id') == rate_plan_id:
                selected = plan
                break
    
    money = selected.get('money') or selected.get('ratePlan', {}).get('money', {})
    guest_total = money.get('hostPayout') or money.get('subTotalPrice', 0)
    
    if not guest_total or guest_total <= 0:
        fare = money.get('fareAccommodation', 0)
        cleaning = money.get('fareCleaning', 0)
        fees = money.get('totalFees', 0)
        taxes = money.get('totalTaxes', 0)
        guest_total = fare + cleaning + fees + taxes
    
    return {
        'guest_total': guest_total,
        'host_payout': money.get('hostPayout', 0),
        'currency': money.get('currency', 'EUR'),
        'rate_plan': selected.get('ratePlan', selected),
        'money': money,
        'days': selected.get('days', [])
    }


@router.post("/checkout/create-session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    """Create Stripe checkout session using Guesty's exact total — no extras added.
    The total charged matches the Guesty quote's hostPayout for the selected rate plan.
    """
    quote = await guesty_service.request('GET', f'/reservations/quotes/{request.quoteId}')
    pricing = extract_pricing(quote, request.ratePlanId)

    total_amount = pricing['guest_total']

    origin_url = request.origin_url.rstrip('/')
    success_url = f"{origin_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/checkout/{request.quoteId}"

    stripe_sdk.api_key = STRIPE_API_KEY
    metadata = {
        'quote_id': request.quoteId,
        'listing_id': quote.get('listingId', ''),
        'guest_email': request.guest.email,
        'guest_name': f"{request.guest.firstName} {request.guest.lastName}",
        'guest_phone': request.guest.phone,
        'rate_plan_id': request.ratePlanId or pricing['rate_plan'].get('_id', ''),
        'check_in': quote.get('checkInDateLocalized', ''),
        'check_out': quote.get('checkOutDateLocalized', ''),
        'guests_count': str(quote.get('guestsCount', 1)),
    }

    if request.specialRequests:
        metadata['special_requests'] = request.specialRequests[:500]  # Stripe metadata limit

    session = stripe_sdk.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': pricing['currency'].lower(),
                'unit_amount': int(round(float(total_amount) * 100)),
                'product_data': {'name': 'Property Reservation'},
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )

    await db.transactions.insert_one({
        'id': str(uuid.uuid4()),
        'session_id': session.id,
        'quote_id': request.quoteId,
        'listing_id': quote.get('listingId', ''),
        'amount': total_amount,
        'currency': pricing['currency'],
        'guest': request.guest.model_dump(),
        'special_requests': request.specialRequests,
        'check_in': quote.get('checkInDateLocalized'),
        'check_out': quote.get('checkOutDateLocalized'),
        'guests_count': quote.get('guestsCount'),
        'status': 'pending',
        'created_at': datetime.now(timezone.utc).isoformat()
    })

    return {
        "url": session.url,
        "session_id": session.id,
        "amount": total_amount,
        "currency": pricing['currency'],
    }


@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Get checkout session status"""
    stripe_sdk.api_key = STRIPE_API_KEY
    session = stripe_sdk.checkout.Session.retrieve(session_id)
    tx = await db.transactions.find_one({'session_id': session_id}, {'_id': 0})
    return {
        'session_id': session.id,
        'payment_status': session.payment_status,
        'status': session.status,
        'amount_total': session.amount_total,
        'currency': session.currency,
        'reservation_id': tx.get('reservation_id') if tx else None,
    }


# ==================== CANONICAL STRIPE ELEMENTS + GUESTY ccToken ====================
# Inline checkout (NO redirect): create PaymentIntent → confirm on-page →
# pass paymentMethodId as `ccToken` to Guesty /reservations/quotes/{id}/instant.

@router.post("/payments/create-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    """Create a Stripe PaymentIntent for the canonical inline Elements flow.
    Amount is computed server-side from the live Guesty quote (never trust client).
    Returns the `client_secret` so the frontend can mount Stripe Elements.
    """
    quote = await guesty_service.request('GET', f'/reservations/quotes/{request.quoteId}')
    pricing = extract_pricing(quote, request.ratePlanId)
    total_amount = pricing['guest_total']
    currency = pricing['currency'].lower()

    stripe_sdk.api_key = STRIPE_API_KEY
    intent = stripe_sdk.PaymentIntent.create(
        amount=int(round(float(total_amount) * 100)),  # cents
        currency=currency,
        automatic_payment_methods={"enabled": True},
        metadata={
            'quote_id': request.quoteId,
            'listing_id': quote.get('listingId', ''),
            'guest_email': request.guest.email,
            'guest_name': f"{request.guest.firstName} {request.guest.lastName}",
            'rate_plan_id': request.ratePlanId or pricing['rate_plan'].get('_id', ''),
        },
    )

    # Pending transaction record — use payment_intent_id as the unique key
    # (sidestepping the legacy unique index on session_id by populating it with the intent id)
    await db.transactions.insert_one({
        'id': str(uuid.uuid4()),
        'session_id': intent.id,  # reuse intent id to satisfy unique index
        'payment_intent_id': intent.id,
        'quote_id': request.quoteId,
        'listing_id': quote.get('listingId', ''),
        'amount': total_amount,
        'currency': pricing['currency'],
        'guest': request.guest.model_dump(),
        'special_requests': request.specialRequests,
        'check_in': quote.get('checkInDateLocalized'),
        'check_out': quote.get('checkOutDateLocalized'),
        'guests_count': quote.get('guestsCount'),
        'rate_plan_id': request.ratePlanId or pricing['rate_plan'].get('_id', ''),
        'flow': 'inline_elements',
        'status': 'pending',
        'created_at': datetime.now(timezone.utc).isoformat(),
    })

    return {
        'clientSecret': intent.client_secret,
        'paymentIntentId': intent.id,
        'amount': total_amount,
        'currency': pricing['currency'],
        'publishableKey': os.environ.get('STRIPE_PUBLISHABLE_KEY', ''),
    }


@router.post("/payments/finalize")
async def finalize_reservation(request: FinalizeReservationRequest):
    """Canonical post-payment reservation creation.
    1. Re-validate the Stripe PaymentIntent server-side (must be `succeeded`).
    2. Resolve the listing's bookingType to pick /instant vs /inquiry.
    3. POST to Guesty with `ccToken: paymentMethodId` so Guesty has the
       canonical record of the card used.
    """
    stripe_sdk.api_key = STRIPE_API_KEY
    intent = stripe_sdk.PaymentIntent.retrieve(request.paymentIntentId)
    if intent.status != "succeeded":
        raise HTTPException(status_code=400, detail={
            "code": "PAYMENT_NOT_CONFIRMED",
            "message": f"Stripe PaymentIntent status is '{intent.status}', expected 'succeeded'.",
        })

    quote = await guesty_service.request('GET', f'/reservations/quotes/{request.quoteId}')
    listing_id = quote.get('listingId', '')

    # Decide instant vs inquiry from listing.bookingType
    booking_endpoint = 'instant'
    try:
        listing = await guesty_service.request('GET', f'/listings/{listing_id}', use_cache=True)
        if (listing.get('bookingType') or '').lower() == 'inquiry':
            booking_endpoint = 'inquiry'
    except Exception as e:
        logger.warning(f"Could not detect bookingType, defaulting to instant: {e}")

    # Canonical Guesty payload — pass paymentMethodId as ccToken
    payload = {
        'ccToken': request.paymentMethodId,
        'guest': {
            'firstName': request.guest.firstName,
            'lastName': request.guest.lastName,
            'email': request.guest.email,
            'phone': request.guest.phone,
        },
    }
    if request.ratePlanId:
        payload['ratePlanId'] = request.ratePlanId
    if request.specialRequests:
        payload['guestNote'] = request.specialRequests[:1000]

    try:
        reservation = await guesty_service.request(
            'POST',
            f'/reservations/quotes/{request.quoteId}/{booking_endpoint}',
            json_data=payload,
        )
    except HTTPException as e:
        await db.transactions.update_one(
            {'payment_intent_id': request.paymentIntentId},
            {'$set': {'status': 'payment_received_booking_failed', 'error': str(e.detail)}}
        )
        raise

    confirmation = reservation.get('confirmationCode') or reservation.get('_id')
    status = 'confirmed' if booking_endpoint == 'instant' else 'inquiry_submitted'

    await db.transactions.update_one(
        {'payment_intent_id': request.paymentIntentId},
        {'$set': {
            'status': status,
            'booking_type': booking_endpoint,
            'reservation_id': reservation.get('_id'),
            'confirmation_code': confirmation,
            'cc_token': request.paymentMethodId,
            'updated_at': datetime.now(timezone.utc).isoformat(),
        }}
    )

    return {
        'status': status,
        'reservationId': reservation.get('_id'),
        'confirmationCode': confirmation,
        'bookingType': booking_endpoint,
    }


@router.get("/payments/intent/{payment_intent_id}")
async def get_payment_intent_status(payment_intent_id: str):
    """Poll PaymentIntent status (used as a safety net by the inline checkout)."""
    stripe_sdk.api_key = STRIPE_API_KEY
    intent = stripe_sdk.PaymentIntent.retrieve(payment_intent_id)
    tx = await db.transactions.find_one(
        {'payment_intent_id': payment_intent_id}, {'_id': 0}
    )
    return {
        'status': intent.status,
        'amount': intent.amount / 100.0,
        'currency': intent.currency,
        'reservation_id': (tx or {}).get('reservation_id'),
        'confirmation_code': (tx or {}).get('confirmation_code'),
        'booking_status': (tx or {}).get('status'),
    }
