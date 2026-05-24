"""Image Optimization Service - Resize, compress, convert images"""
import os
import io
import base64
from PIL import Image
from typing import Tuple, Optional
import hashlib

class ImageOptimizer:
    """Handle image optimization for CMS uploads"""
    
    def __init__(self, upload_dir: str = "/tmp/cvpm_images"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
        
    def optimize_image(
        self,
        image_data: bytes,
        max_width: int = 1920,
        max_height: int = 1080,
        quality: int = 85,
        format: str = "WEBP"
    ) -> Tuple[bytes, str]:
        """Optimize image: resize, compress, convert format
        
        Args:
            image_data: Raw image bytes
            max_width: Maximum width in pixels
            max_height: Maximum height in pixels
            quality: JPEG/WebP quality (1-100)
            format: Output format (WEBP, JPEG, PNG)
            
        Returns:
            Tuple of (optimized_bytes, content_type)
        """
        try:
            # Load image
            img = Image.open(io.BytesIO(image_data))
            
            # Convert RGBA to RGB for JPEG
            if img.mode in ('RGBA', 'LA') and format.upper() == 'JPEG':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            elif img.mode != 'RGB' and format.upper() in ('JPEG', 'WEBP'):
                img = img.convert('RGB')
                
            # Resize if needed
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
            # Save to buffer
            output = io.BytesIO()
            save_params = {'format': format.upper(), 'optimize': True}
            
            if format.upper() in ('JPEG', 'WEBP'):
                save_params['quality'] = quality
            elif format.upper() == 'PNG':
                save_params['compress_level'] = 9
                
            img.save(output, **save_params)
            optimized_data = output.getvalue()
            
            # Determine content type
            content_type = f"image/{format.lower()}"
            if format.upper() == 'JPEG':
                content_type = "image/jpeg"
                
            return optimized_data, content_type
            
        except Exception as e:
            raise ValueError(f"Image optimization failed: {str(e)}")
            
    def generate_thumbnail(
        self,
        image_data: bytes,
        size: Tuple[int, int] = (300, 300)
    ) -> bytes:
        """Generate square thumbnail"""
        try:
            img = Image.open(io.BytesIO(image_data))
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=80, optimize=True)
            return output.getvalue()
        except Exception as e:
            raise ValueError(f"Thumbnail generation failed: {str(e)}")
            
    def save_image(
        self,
        image_data: bytes,
        filename: Optional[str] = None
    ) -> str:
        """Save optimized image to disk
        
        Args:
            image_data: Image bytes
            filename: Optional filename (auto-generated if not provided)
            
        Returns:
            Saved file path
        """
        if not filename:
            # Generate hash-based filename
            img_hash = hashlib.md5(image_data).hexdigest()[:16]
            filename = f"{img_hash}.webp"
            
        filepath = os.path.join(self.upload_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(image_data)
            
        return filepath
        
    def get_image_info(self, image_data: bytes) -> dict:
        """Get image metadata"""
        try:
            img = Image.open(io.BytesIO(image_data))
            return {
                'width': img.width,
                'height': img.height,
                'format': img.format,
                'mode': img.mode,
                'size_bytes': len(image_data)
            }
        except Exception as e:
            raise ValueError(f"Failed to read image info: {str(e)}")

# Singleton instance
image_optimizer = ImageOptimizer()
