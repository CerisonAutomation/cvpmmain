"""Dynamic sitemap for SEO."""
from fastapi import APIRouter
from fastapi.responses import Response
from datetime import datetime, timezone

router = APIRouter(tags=["SEO"])

db = None
guesty_service = None

STATIC_PATHS = [
    "/",
    "/properties",
    "/property-owners",
    "/for-owners",
    "/map",
]


def init_sitemap_routes(database, guesty_svc):
    global db, guesty_service
    db = database
    guesty_service = guesty_svc


def _url_entry(loc: str, lastmod: str | None = None) -> str:
    lm = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
    return f"  <url><loc>{loc}</loc>{lm}</url>"


@router.get("/sitemap.xml")
async def sitemap_xml():
    base = "https://www.christianopropertymanagement.com"
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entries = [_url_entry(f"{base}{p}", today) for p in STATIC_PATHS]

    try:
        data = await guesty_service.request("GET", "/listings", use_cache=True)
        listings = data if isinstance(data, list) else data.get("results", data.get("listings", []))
        for item in listings[:500]:
            lid = item.get("_id") or item.get("id")
            if lid:
                entries.append(_url_entry(f"{base}/property/{lid}", today))
    except Exception:
        pass

    body = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>"
    )
    return Response(content=body, media_type="application/xml")
