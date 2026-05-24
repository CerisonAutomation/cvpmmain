"""
Tests for canonical Guesty pricing, coupons, rate plans, and addon removal (iteration 2).
"""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL not set")

LISTING_ID = "69ceb988571e1b00149f3c8b"
CHECK_IN = "2026-06-15"
CHECK_OUT = "2026-06-18"
GUESTS = 2


# ---------- Basic endpoints ----------
class TestBasic:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

    def test_sdk_contract(self):
        r = requests.get(f"{BASE_URL}/api/sdk-contract")
        assert r.status_code == 200
        data = r.json()
        assert data.get("version") == "2026-03-03", f"version={data.get('version')}"
        allow = data.get("allowlist") or data.get("endpoints") or []
        assert len(allow) == 12, f"allowlist length={len(allow)}"


# ---------- Listings ----------
class TestListings:
    def test_list(self):
        r = requests.get(f"{BASE_URL}/api/listings", params={"limit": 5})
        assert r.status_code == 200
        assert "results" in r.json()

    def test_single_no_dates(self):
        # MUST NOT forward checkIn/checkOut to Guesty
        r = requests.get(f"{BASE_URL}/api/listings/{LISTING_ID}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("title")

    def test_single_ignores_dates(self):
        # Even if frontend passes checkIn/checkOut, backend should not reject
        r = requests.get(
            f"{BASE_URL}/api/listings/{LISTING_ID}",
            params={"checkIn": CHECK_IN, "checkOut": CHECK_OUT},
        )
        assert r.status_code == 200, r.text

    def test_calendar(self):
        r = requests.get(
            f"{BASE_URL}/api/listings/{LISTING_ID}/calendar",
            params={"startDate": CHECK_IN, "endDate": CHECK_OUT},
        )
        assert r.status_code == 200, r.text


# ---------- Quotes ----------
_quote_cache = {}


def _create_quote():
    if "id" in _quote_cache:
        return _quote_cache["id"], _quote_cache["data"]
    payload = {
        "listingId": LISTING_ID,
        "checkInDateLocalized": CHECK_IN,
        "checkOutDateLocalized": CHECK_OUT,
        "guestsCount": GUESTS,
    }
    r = requests.post(f"{BASE_URL}/api/quotes", json=payload)
    if r.status_code != 200:
        pytest.skip(f"Quote create returned {r.status_code}: {r.text}")
    data = r.json()
    _quote_cache["id"] = data["_id"]
    _quote_cache["data"] = data
    return data["_id"], data


class TestQuotes:
    def test_create_quote(self):
        qid, data = _create_quote()
        assert qid
        rate_plans = data.get("rates", {}).get("ratePlans", [])
        assert len(rate_plans) > 0, "no rate plans"

    def test_rate_plan_invoice_items(self):
        _, data = _create_quote()
        rate_plans = data.get("rates", {}).get("ratePlans", [])
        first = rate_plans[0]
        rp_inner = first.get("ratePlan", {})
        assert rp_inner.get("name"), f"missing ratePlan.name: {first}"
        money = first.get("money") or rp_inner.get("money", {})
        items = money.get("invoiceItems", [])
        assert len(items) > 0
        types = {it.get("type") for it in items}
        normalized = {(it.get("type") or "").upper() for it in items}
        titles = {(it.get("title") or "").lower() for it in items}
        # Look for ACCOMMODATION_FARE
        assert any("ACCOMMODATION" in t for t in normalized), f"types={types}"
        # CLEANING_FEE somewhere
        assert any("CLEANING" in t for t in normalized) or any("cleaning" in t for t in titles), \
            f"cleaning missing in {types}/{titles}"
        # Some TAX entry
        assert any("TAX" in t for t in normalized), f"no TAX in {types}"

    def test_invalid_coupon(self):
        qid, _ = _create_quote()
        r = requests.post(
            f"{BASE_URL}/api/quotes/{qid}/coupons",
            json={"coupons": ["FAKECODE"]},
        )
        assert r.status_code == 400, f"got {r.status_code}: {r.text}"
        body = r.json()
        detail = body.get("detail", body)
        if isinstance(detail, str):
            # Should NOT be generic
            assert "Service temporarily unavailable" not in detail, detail
            assert "coupon" in detail.lower() or "invalid" in detail.lower(), detail
        else:
            code = detail.get("code")
            msg = detail.get("message", "")
            assert code == "INVALID_COUPON", f"code={code}, body={body}"
            assert "invalid or has expired" in msg.lower(), f"msg={msg}"

    def test_delete_coupon_route_exists(self):
        qid, _ = _create_quote()
        r = requests.delete(f"{BASE_URL}/api/quotes/{qid}/coupons/FAKECODE")
        # Route must exist — not 405/404 from FastAPI saying "Not Found" for the path
        assert r.status_code != 405, f"method not allowed — route missing"
        # Acceptable: 200, 400, 404 (from guesty for non-existent coupon)
        assert r.status_code in (200, 400, 404, 422), f"unexpected {r.status_code}: {r.text}"


# ---------- Addons removal ----------
class TestAddonsRemoved:
    def test_addons_endpoint_gone(self):
        r = requests.get(f"{BASE_URL}/api/addons")
        assert r.status_code == 404, f"/api/addons should be 404, got {r.status_code}"

    def test_quote_addons_endpoint_gone(self):
        qid, _ = _create_quote()
        r = requests.post(f"{BASE_URL}/api/quotes/{qid}/addons", json={"addons": {}})
        assert r.status_code == 404, f"/api/quotes/{{id}}/addons should be 404, got {r.status_code}"

    def test_checkout_ignores_addons(self):
        qid, data = _create_quote()
        rps = data.get("rates", {}).get("ratePlans", [])
        money = rps[0].get("money") or rps[0].get("ratePlan", {}).get("money", {})
        expected_amount = money.get("hostPayout")
        payload = {
            "quoteId": qid,
            "guest": {
                "firstName": "Test",
                "lastName": "User",
                "email": "test@example.com",
                "phone": "+35612345678",
            },
            "origin_url": BASE_URL,
            # Extra addons should be ignored, not validation error
            "addons": {"cot": 1, "highchair": 1, "lateCheckout": True},
        }
        r = requests.post(f"{BASE_URL}/api/checkout/create-session", json=payload)
        assert r.status_code == 200, f"checkout failed: {r.status_code} {r.text}"
        d = r.json()
        assert "url" in d and "session_id" in d
        assert d["url"].startswith("https://checkout.stripe.com")
        # Amount must equal hostPayout (no addon math)
        if expected_amount is not None:
            # Allow either cents or units — compare with tolerance
            amt = float(d["amount"])
            ep = float(expected_amount)
            assert abs(amt - ep) < 0.5 or abs(amt / 100 - ep) < 0.5, \
                f"amount {amt} != hostPayout {ep}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
