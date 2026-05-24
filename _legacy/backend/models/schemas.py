"""
Pydantic models for the CVPM Booking Platform
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any


# ==================== GUEST & BOOKING MODELS ====================

class GuestInfo(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str


class NumberOfGuests(BaseModel):
    """Detailed guest breakdown sent to Guesty alongside guestsCount."""
    adults: int = 1
    children: int = 0
    infants: int = 0
    pets: int = 0


class QuoteRequest(BaseModel):
    listingId: str
    checkInDateLocalized: str
    checkOutDateLocalized: str
    guestsCount: int = 1
    numberOfGuests: Optional[NumberOfGuests] = None
    guest: Optional[GuestInfo] = None
    # Comma-separated coupon codes (Guesty BEAPI format) — also accepts a list
    coupons: Optional[str] = None


class CouponRequest(BaseModel):
    """Apply coupons to a Guesty quote via PUT /reservations/quotes/{id}/coupons.
    Guesty accepts comma-separated codes in a single string."""
    coupons: str  # e.g. "SUMMER10,LOYAL5"


class InstantReservationRequest(BaseModel):
    """POST /reservations/quotes/{quoteId}/instant — canonical Guesty BEAPI fields."""
    ratePlanId: str
    ccToken: str  # Stripe SCA token, must start with pm_
    guest: GuestInfo
    policy: Optional[Dict[str, Any]] = None


class InquiryReservationRequest(BaseModel):
    """POST /reservations/quotes/{quoteId}/inquiry — canonical Guesty BEAPI fields."""
    ratePlanId: str
    guest: GuestInfo
    ccToken: Optional[str] = None  # optional for inquiry
    # -1 = no expiry; allowed: -1, 12, 24, 36, 48, 72 (hours)
    reservedUntil: Optional[int] = Field(default=-1, description="Hours to hold reservation")
    policy: Optional[Dict[str, Any]] = None


class CheckoutRequest(BaseModel):
    quoteId: str
    ratePlanId: Optional[str] = None
    guest: GuestInfo
    origin_url: str
    specialRequests: Optional[str] = None


class PaymentIntentRequest(BaseModel):
    """Canonical inline Stripe Elements: server creates a PaymentIntent for a Guesty quote."""
    quoteId: str
    ratePlanId: Optional[str] = None
    guest: GuestInfo
    specialRequests: Optional[str] = None


class FinalizeReservationRequest(BaseModel):
    """After Stripe PaymentIntent succeeds, finalise the Guesty reservation.
    Passes the Stripe PaymentMethod ID as `ccToken` so Guesty has the record
    (canonical BEAPI flow). Backend re-validates the PaymentIntent server-side
    so the client can't fake a confirmed payment.
    """
    quoteId: str
    paymentIntentId: str
    paymentMethodId: str
    ratePlanId: Optional[str] = None
    guest: GuestInfo
    specialRequests: Optional[str] = None


# ==================== CONTACT & INQUIRY MODELS ====================

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


class PropertyOwnerInquiry(BaseModel):
    propertyType: str
    location: str
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    maxGuests: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    servicesInterested: Optional[str] = None
    currentlyListed: Optional[str] = None
    additionalInfo: Optional[str] = None


# ==================== CMS MODELS ====================

class CMSUpdate(BaseModel):
    data: Dict[str, Any]


class AIGenerateRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None
    section: Optional[str] = None
    field: Optional[str] = None


class AdminConfig(BaseModel):
    guesty_client_id: Optional[str] = None
    guesty_client_secret: Optional[str] = None
    stripe_publishable_key: Optional[str] = None


# ==================== WEBSOCKET MODELS ====================

class BlockUpdate(BaseModel):
    block_id: str
    field: str
    value: Any
    page: str = "home"


class AIBlockRequest(BaseModel):
    block_id: str
    block_type: str
    field: str
    current_value: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
