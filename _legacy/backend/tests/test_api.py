"""
Backend API Tests for Malta Stays Direct Booking Platform
Tests Guesty API integration, quote creation, checkout flow, and CMS endpoints
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

# Base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL not set")

# Test data - Using specific dates from Guesty that are known to work
TEST_LISTING_ID = "6878a53283f1c400114b71e8"  # Known test listing
# Use dynamic dates relative to today to avoid DATES_IN_PAST errors
_today = datetime.utcnow().date()
TEST_CHECK_IN = (_today + timedelta(days=60)).isoformat()
TEST_CHECK_OUT = (_today + timedelta(days=65)).isoformat()
TEST_GUESTS = 2


class TestHealthAndBasicEndpoints:
    """Test health and basic endpoints"""

    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print("✓ Health endpoint working")

    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        print("✓ Root endpoint working")

    def test_sdk_contract(self):
        """Test /api/sdk-contract returns contract"""
        response = requests.get(f"{BASE_URL}/api/sdk-contract")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data
        assert "allowlist" in data
        print("✓ SDK contract endpoint working")


class TestListingsAPI:
    """Test Guesty listings endpoints"""

    def test_get_listings(self):
        """Test GET /api/listings returns property list"""
        response = requests.get(f"{BASE_URL}/api/listings", params={"limit": 10})
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) > 0
        print(f"✓ Listings API returned {len(data['results'])} properties")

    def test_get_listings_with_filters(self):
        """Test listings with filter parameters"""
        response = requests.get(f"{BASE_URL}/api/listings", params={
            "limit": 100,
            "numberOfBedrooms": 2,
        })
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        print(f"✓ Filtered listings returned {len(data['results'])} properties")

    def test_get_single_listing(self):
        """Test GET /api/listings/{id} returns single property"""
        response = requests.get(f"{BASE_URL}/api/listings/{TEST_LISTING_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "_id" in data or "id" in data
        assert "title" in data
        assert "prices" in data
        print(f"✓ Single listing: {data.get('title', 'N/A')}")

    def test_listing_has_required_fields(self):
        """Verify listing has all required fields for display"""
        response = requests.get(f"{BASE_URL}/api/listings/{TEST_LISTING_ID}")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields for PropertyDetailPage
        required_fields = ["title", "prices", "address"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check prices has basePrice
        assert "basePrice" in data.get("prices", {}), "Missing basePrice in prices"
        print("✓ Listing has all required fields")


class TestQuoteAPI:
    """Test quote creation and retrieval"""

    def test_create_quote(self):
        """Test POST /api/quotes creates a valid quote"""
        payload = {
            "listingId": TEST_LISTING_ID,
            "checkInDateLocalized": TEST_CHECK_IN,
            "checkOutDateLocalized": TEST_CHECK_OUT,
            "guestsCount": TEST_GUESTS,
        }
        response = requests.post(f"{BASE_URL}/api/quotes", json=payload)
        assert response.status_code == 200, f"Quote creation failed: {response.text}"
        data = response.json()
        
        # Verify quote structure
        assert "_id" in data, "Quote missing _id"
        assert "rates" in data, "Quote missing rates"
        assert "ratePlans" in data.get("rates", {}), "Quote missing ratePlans"
        
        quote_id = data["_id"]
        print(f"✓ Quote created: {quote_id}")
        
        return quote_id

    def test_get_quote(self):
        """Test GET /api/quotes/{id} retrieves quote"""
        # First create a quote
        payload = {
            "listingId": TEST_LISTING_ID,
            "checkInDateLocalized": TEST_CHECK_IN,
            "checkOutDateLocalized": TEST_CHECK_OUT,
            "guestsCount": TEST_GUESTS,
        }
        create_response = requests.post(f"{BASE_URL}/api/quotes", json=payload)
        assert create_response.status_code == 200
        quote_id = create_response.json()["_id"]
        
        # Then retrieve it
        get_response = requests.get(f"{BASE_URL}/api/quotes/{quote_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["_id"] == quote_id
        print(f"✓ Quote retrieved successfully")

    def test_quote_pricing(self):
        """Test that quote returns proper pricing breakdown"""
        payload = {
            "listingId": TEST_LISTING_ID,
            "checkInDateLocalized": TEST_CHECK_IN,
            "checkOutDateLocalized": TEST_CHECK_OUT,
            "guestsCount": TEST_GUESTS,
        }
        response = requests.post(f"{BASE_URL}/api/quotes", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        rate_plan = data.get("rates", {}).get("ratePlans", [{}])[0]
        money = rate_plan.get("money") or rate_plan.get("ratePlan", {}).get("money", {})
        
        assert money, "Quote missing money/pricing data"
        assert "hostPayout" in money or "fareAccommodation" in money, "Missing pricing totals"
        
        total = money.get("hostPayout") or money.get("subTotalPrice", 0)
        print(f"✓ Quote total: €{total}")


class TestCheckoutAPI:
    """Test checkout/Stripe integration"""

    def test_create_checkout_session(self):
        """Test POST /api/checkout/create-session creates Stripe session"""
        # First create a quote
        quote_payload = {
            "listingId": TEST_LISTING_ID,
            "checkInDateLocalized": TEST_CHECK_IN,
            "checkOutDateLocalized": TEST_CHECK_OUT,
            "guestsCount": TEST_GUESTS,
        }
        quote_response = requests.post(f"{BASE_URL}/api/quotes", json=quote_payload)
        assert quote_response.status_code == 200
        quote_id = quote_response.json()["_id"]
        
        # Create checkout session
        checkout_payload = {
            "quoteId": quote_id,
            "guest": {
                "firstName": "Test",
                "lastName": "User",
                "email": "test@example.com",
                "phone": "+35612345678"
            },
            "origin_url": BASE_URL
        }
        response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=checkout_payload)
        assert response.status_code == 200, f"Checkout failed: {response.text}"
        data = response.json()
        
        assert "url" in data, "Missing Stripe checkout URL"
        assert "session_id" in data, "Missing session_id"
        assert "amount" in data, "Missing amount"
        assert data["url"].startswith("https://checkout.stripe.com"), "Invalid Stripe URL"
        print(f"✓ Stripe checkout session created, amount: €{data['amount']}")


class TestCMSAPI:
    """Test CMS content endpoints"""

    def test_get_cms(self):
        """Test GET /api/cms returns CMS content"""
        response = requests.get(f"{BASE_URL}/api/cms")
        assert response.status_code == 200
        print("✓ CMS endpoint working")

    def test_get_cms_section(self):
        """Test GET /api/cms/{section} returns section"""
        response = requests.get(f"{BASE_URL}/api/cms/hero")
        assert response.status_code == 200
        print("✓ CMS section endpoint working")


class TestContactAPI:
    """Test contact form endpoints"""

    def test_submit_contact(self):
        """Test POST /api/contact submits form"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+35612345678",
            "subject": "Test Inquiry",
            "message": "This is a test message from automated testing."
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Contact form submission working")

    def test_submit_owner_inquiry(self):
        """Test POST /api/property-owner-inquiry submits owner form"""
        payload = {
            "propertyType": "Apartment",
            "location": "Valletta",
            "bedrooms": "2",
            "bathrooms": "1",
            "maxGuests": "4",
            "name": "Test Owner",
            "email": "owner@example.com",
            "phone": "+35612345678",
            "servicesInterested": "Full management",
            "currentlyListed": "No",
            "additionalInfo": "Test property inquiry"
        }
        response = requests.post(f"{BASE_URL}/api/property-owner-inquiry", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Owner inquiry submission working")


class TestErrorHandling:
    """Test error handling"""

    def test_invalid_listing_id(self):
        """Test invalid listing ID returns proper error"""
        response = requests.get(f"{BASE_URL}/api/listings/invalid-id-12345")
        assert response.status_code in [400, 404, 500]
        print("✓ Invalid listing ID handled properly")

    def test_invalid_quote_payload(self):
        """Test invalid quote payload returns error"""
        payload = {
            "listingId": TEST_LISTING_ID,
            # Missing required dates
        }
        response = requests.post(f"{BASE_URL}/api/quotes", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Invalid quote payload handled properly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
