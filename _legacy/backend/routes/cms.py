"""
CMS Routes - Content Management System with Versioning & Publishing
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from limiter import limiter
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from auth import verify_token
from models.schemas import CMSUpdate, AIGenerateRequest
from services.ai_service import ai_service

router = APIRouter(tags=["CMS"])

# Will be initialized from main app
db = None


def init_cms_routes(database):
    """Initialize routes with database"""
    global db
    db = database


# ==================== CMS CONTENT (PUBLISHED) ====================

@router.get("/cms")
async def get_cms():
    """Get all published CMS content (for public frontend)"""
    cms = await db.cms.find_one({}, {'_id': 0})
    return cms or {}


@router.get("/cms/{section}")
async def get_cms_section(section: str):
    """Get CMS section (published content)"""
    cms = await db.cms.find_one({}, {'_id': 0})
    return cms.get(section, {}) if cms else {}


# ==================== CMS DRAFTS & VERSIONING ====================

@router.get("/cms/admin/drafts")
async def get_cms_drafts(_: str = Depends(verify_token)):
    """Get draft CMS content (admin only)"""
    draft = await db.cms_drafts.find_one({}, {'_id': 0})
    if not draft:
        published = await db.cms.find_one({}, {'_id': 0})
        return published or {}
    return draft


@router.put("/cms/admin/draft/{section}")
async def update_cms_draft(section: str, request: CMSUpdate, _: str = Depends(verify_token)):
    """Update CMS draft section (admin only) - auto-saves"""
    timestamp = datetime.now(timezone.utc).isoformat()
    
    await db.cms_drafts.update_one(
        {}, 
        {
            '$set': {
                section: request.data,
                f'_meta.{section}_updated': timestamp,
                '_meta.last_updated': timestamp,
                '_meta.status': 'draft'
            }
        }, 
        upsert=True
    )
    return {"success": True, "saved_at": timestamp}


@router.post("/cms/admin/publish")
async def publish_cms(_: str = Depends(verify_token)):
    """Publish CMS changes with version history"""
    timestamp = datetime.now(timezone.utc).isoformat()
    
    draft = await db.cms_drafts.find_one({}, {'_id': 0})
    if not draft:
        raise HTTPException(status_code=400, detail="No draft content to publish")
    
    current_published = await db.cms.find_one({}, {'_id': 0})
    
    if current_published:
        version_count = await db.cms_versions.count_documents({})
        await db.cms_versions.insert_one({
            'version': version_count + 1,
            'content': current_published,
            'published_at': timestamp,
            'created_at': current_published.get('_meta', {}).get('last_published', timestamp)
        })
    
    draft_clean = {k: v for k, v in draft.items() if not k.startswith('_')}
    draft_clean['_meta'] = {
        'last_published': timestamp,
        'version': (await db.cms_versions.count_documents({})) + 1
    }
    
    await db.cms.delete_many({})
    await db.cms.insert_one(draft_clean)
    
    await db.cms_drafts.update_one(
        {},
        {'$set': {'_meta.status': 'published', '_meta.last_published': timestamp}}
    )
    
    return {
        "success": True, 
        "published_at": timestamp,
        "version": draft_clean['_meta']['version'],
    }


@router.get("/cms/admin/versions")
async def get_cms_versions(_: str = Depends(verify_token)):
    """Get CMS version history (last 10)"""
    versions = await db.cms_versions.find(
        {}, 
        {'_id': 0, 'content': 0}
    ).sort('version', -1).limit(10).to_list(10)
    return {"versions": versions}


@router.post("/cms/admin/rollback/{version}")
async def rollback_cms(version: int, _: str = Depends(verify_token)):
    """Rollback to a specific CMS version"""
    version_doc = await db.cms_versions.find_one({'version': version}, {'_id': 0})
    if not version_doc:
        raise HTTPException(status_code=404, detail=f"Version {version} not found")
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    current = await db.cms.find_one({}, {'_id': 0})
    if current:
        version_count = await db.cms_versions.count_documents({})
        await db.cms_versions.insert_one({
            'version': version_count + 1,
            'content': current,
            'published_at': timestamp,
            'rollback_from': version,
            'created_at': timestamp
        })
    
    restored = version_doc['content']
    restored['_meta'] = {
        'last_published': timestamp,
        'version': (await db.cms_versions.count_documents({})) + 1,
        'rolled_back_from': version
    }
    
    await db.cms.delete_many({})
    await db.cms.insert_one(restored)
    
    await db.cms_drafts.delete_many({})
    await db.cms_drafts.insert_one(restored)
    
    return {"success": True, "restored_version": version, "new_version": restored['_meta']['version']}


@router.put("/cms/{section}")
async def update_cms_section(section: str, request: CMSUpdate, _: str = Depends(verify_token)):
    """Update CMS section directly (legacy - use draft/publish flow instead)"""
    timestamp = datetime.now(timezone.utc).isoformat()
    
    await db.cms.update_one({}, {'$set': {section: request.data}}, upsert=True)
    await db.cms_drafts.update_one(
        {}, 
        {'$set': {section: request.data, '_meta.last_updated': timestamp}}, 
        upsert=True
    )
    return {"success": True}


@router.post("/cms/reset")
async def reset_cms(_: str = Depends(verify_token)):
    """Reset CMS to defaults (admin only)"""
    await db.cms.delete_many({})
    await db.cms_drafts.delete_many({})
    return {"success": True, "message": "CMS reset to defaults"}


# ==================== AI CONTENT GENERATION ====================

@router.get("/cms/pages/{slug}")
async def get_cms_page(slug: str):
    """Published page blocks by slug."""
    doc = await db.cms_pages.find_one(
        {"slug": slug, "status": "published"},
        {"_id": 0},
    )
    if doc:
        return doc
    legacy = await db.cms_pages.find_one(
        {"slug": slug, "status": {"$exists": False}},
        {"_id": 0},
    )
    if legacy:
        return legacy
    return {"slug": slug, "blocks": [], "seo": {}}


@router.put("/cms/pages/{slug}")
async def save_cms_page(slug: str, body: dict, _: str = Depends(verify_token)):
    """Save page draft (admin)."""
    blocks = body.get("blocks", [])
    seo = body.get("seo", {})
    await db.cms_page_drafts.update_one(
        {"slug": slug},
        {
            "$set": {
                "slug": slug,
                "blocks": blocks,
                "seo": seo,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )
    return {"success": True, "slug": slug}


@router.post("/cms/pages/{slug}/publish")
async def publish_cms_page(slug: str, _: str = Depends(verify_token)):
    """Publish draft page to live cms_pages."""
    draft = await db.cms_page_drafts.find_one({"slug": slug}, {"_id": 0})
    if not draft:
        page = await db.cms_pages.find_one({"slug": slug, "status": "published"}, {"_id": 0})
        if page and page.get("blocks"):
            return {"success": True, "slug": slug, "message": "already published"}
        raise HTTPException(status_code=404, detail="No draft to publish")
    payload = {
        "slug": slug,
        "blocks": draft.get("blocks", []),
        "seo": draft.get("seo", {}),
        "status": "published",
        "published_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.cms_pages.update_one({"slug": slug}, {"$set": payload}, upsert=True)
    return {"success": True, "slug": slug}


@router.post("/ai/generate")
@limiter.limit("20/minute")
async def generate_ai_content(request: Request, req: AIGenerateRequest, _: str = Depends(verify_token)):
    """Generate AI content for CMS"""
    content = await ai_service.generate_content(
        prompt=req.prompt,
        context=req.context,
        section=req.section,
        field=req.field
    )
    return {"content": content, "section": req.section, "field": req.field}


@router.post("/ai/generate-block")
@limiter.limit("20/minute")
async def generate_block_content(request: Request, req: AIGenerateRequest, _: str = Depends(verify_token)):
    """Generate AI content for a specific block field"""
    content = await ai_service.generate_block_content(
        block_type=req.section or "text",
        field=req.field or "content",
        current_value=req.prompt if req.prompt else None,
        context=req.context
    )
    return {"content": content, "block_type": req.section, "field": req.field}


@router.post("/ai/generate-seo")
@limiter.limit("20/minute")
async def generate_seo_content(request: Request, page: str = "home", _: str = Depends(verify_token)):
    """Generate SEO metadata for a page"""
    seo = await ai_service.generate_seo_content(page)
    return seo


@router.post("/ai/generate-image")
@limiter.limit("10/minute")
async def generate_ai_image(request: Request, req: AIGenerateRequest, _: str = Depends(verify_token)):
    """Generate AI image via AI service"""
    content = await ai_service.generate_image(req.prompt)
    return {
        "url": content,
        "prompt": req.prompt
    }


@router.post("/ai/rewrite-formal")
@limiter.limit("20/minute")
async def rewrite_formal(request: Request, req: AIGenerateRequest, _: str = Depends(verify_token)):
    content = await ai_service.generate_content(
        prompt=f"Rewrite in a formal luxury tone: {req.prompt}",
        context=req.context,
        section=req.section,
        field=req.field,
    )
    return {"content": content}


@router.post("/ai/seo-optimize")
@limiter.limit("20/minute")
async def seo_optimize(request: Request, req: AIGenerateRequest, _: str = Depends(verify_token)):
    content = await ai_service.generate_seo_content(req.section or "home")
    return content


@router.post("/ai/generate-stream")
@limiter.limit("20/minute")
async def generate_ai_stream(request: Request, req: AIGenerateRequest, _: str = Depends(verify_token)):
    """Stream AI content via Server-Sent Events."""
    from fastapi.responses import StreamingResponse
    import json

    async def event_stream():
        text = await ai_service.generate_content(
            prompt=req.prompt,
            context=req.context,
            section=req.section,
            field=req.field,
        )
        chunk_size = 40
        for i in range(0, len(text), chunk_size):
            chunk = text[i : i + chunk_size]
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
