"""Media upload and optimization endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import base64

from services.image_service import image_optimizer

router = APIRouter(prefix="/media", tags=["media"])

class ImageOptimizeRequest(BaseModel):
    image_base64: str
    max_width: Optional[int] = 1920
    max_height: Optional[int] = 1080
    quality: Optional[int] = 85
    format: Optional[str] = "WEBP"

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload and optimize image"""
    try:
        # Read file
        content = await file.read()
        
        # Get info
        info = image_optimizer.get_image_info(content)
        original_size = info['size_bytes']
        
        # Optimize
        optimized_data, content_type = image_optimizer.optimize_image(
            content,
            max_width=1920,
            max_height=1080,
            quality=85,
            format="WEBP"
        )
        
        # Save
        filepath = image_optimizer.save_image(optimized_data)
        
        # Generate thumbnail
        thumbnail_data = image_optimizer.generate_thumbnail(content)
        
        return {
            "success": True,
            "url": f"/api/media/serve/{filepath.split('/')[-1]}",
            "thumbnail_url": f"/api/media/thumb/{filepath.split('/')[-1]}",
            "original_size": original_size,
            "optimized_size": len(optimized_data),
            "compression_ratio": round((1 - len(optimized_data) / original_size) * 100, 1),
            "width": info['width'],
            "height": info['height'],
            "format": "WEBP"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/optimize")
async def optimize_image(request: ImageOptimizeRequest):
    """Optimize base64 encoded image"""
    try:
        # Decode base64
        image_data = base64.b64decode(request.image_base64)
        
        # Optimize
        optimized_data, content_type = image_optimizer.optimize_image(
            image_data,
            max_width=request.max_width,
            max_height=request.max_height,
            quality=request.quality,
            format=request.format
        )
        
        # Return as base64
        optimized_base64 = base64.b64encode(optimized_data).decode('utf-8')
        
        return {
            "success": True,
            "image_base64": optimized_base64,
            "content_type": content_type,
            "original_size": len(image_data),
            "optimized_size": len(optimized_data),
            "compression_ratio": round((1 - len(optimized_data) / len(image_data)) * 100, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/serve/{filename}")
async def serve_image(filename: str):
    """Serve optimized image"""
    try:
        import os
        filepath = os.path.join("/tmp/cvpm_images", filename)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Image not found")
        
        with open(filepath, 'rb') as f:
            return Response(content=f.read(), media_type="image/webp")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
