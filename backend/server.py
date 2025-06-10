from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import shutil
import aiofiles
from PIL import Image
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Event Snap Stream API", description="Photo sharing for events")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class PhotoMetadata(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_filename: str
    file_size: int
    content_type: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    uploader_info: Optional[str] = None

class PhotoResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    content_type: str
    uploaded_at: datetime
    url: str
    thumbnail_url: str

# Utility functions
async def save_uploaded_file(upload_file: UploadFile, filename: str) -> str:
    """Save uploaded file to disk"""
    file_path = UPLOAD_DIR / filename
    async with aiofiles.open(file_path, 'wb') as buffer:
        content = await upload_file.read()
        await buffer.write(content)
    return str(file_path)

def create_thumbnail(image_path: str, thumbnail_path: str, size: tuple = (300, 300)) -> bool:
    """Create thumbnail from uploaded image"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Create thumbnail
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, 'JPEG', quality=85, optimize=True)
            return True
    except Exception as e:
        logging.error(f"Error creating thumbnail: {e}")
        return False

def validate_image_file(file: UploadFile) -> bool:
    """Validate if uploaded file is a valid image"""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    return file.content_type in allowed_types

# Routes
@api_router.get("/")
async def root():
    return {"message": "Event Snap Stream API", "status": "running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/photos/upload", response_model=PhotoResponse)
async def upload_photo(
    file: UploadFile = File(...),
    uploader_info: Optional[str] = None
):
    """Upload a photo to the event wall"""
    
    # Validate file
    if not validate_image_file(file):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        )
    
    # Check file size (10MB limit)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB."
        )
    
    try:
        # Generate unique filename
        file_extension = file.filename.split('.')[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        thumbnail_filename = f"thumb_{unique_filename.replace(f'.{file_extension}', '.jpg')}"
        
        # Save uploaded file
        file_path = await save_uploaded_file(file, unique_filename)
        
        # Create thumbnail
        thumbnail_path = UPLOAD_DIR / thumbnail_filename
        thumbnail_created = create_thumbnail(file_path, str(thumbnail_path))
        
        # Create photo metadata
        photo_metadata = PhotoMetadata(
            filename=unique_filename,
            original_filename=file.filename,
            file_size=file.size,
            content_type=file.content_type,
            uploader_info=uploader_info
        )
        
        # Save to database
        await db.photos.insert_one(photo_metadata.dict())
        
        # Return response
        return PhotoResponse(
            id=photo_metadata.id,
            filename=photo_metadata.filename,
            original_filename=photo_metadata.original_filename,
            file_size=photo_metadata.file_size,
            content_type=photo_metadata.content_type,
            uploaded_at=photo_metadata.uploaded_at,
            url=f"/api/photos/file/{unique_filename}",
            thumbnail_url=f"/api/photos/thumbnail/{thumbnail_filename}" if thumbnail_created else f"/api/photos/file/{unique_filename}"
        )
        
    except Exception as e:
        logging.error(f"Error uploading photo: {e}")
        raise HTTPException(status_code=500, detail="Error uploading photo")

@api_router.get("/photos", response_model=List[PhotoResponse])
async def get_photos():
    """Get all uploaded photos"""
    try:
        photos = await db.photos.find().sort("uploaded_at", -1).to_list(1000)
        
        photo_responses = []
        for photo in photos:
            # Check if thumbnail exists
            thumbnail_filename = f"thumb_{photo['filename'].replace(photo['filename'].split('.')[-1], 'jpg')}"
            thumbnail_path = UPLOAD_DIR / thumbnail_filename
            
            photo_responses.append(PhotoResponse(
                id=photo['id'],
                filename=photo['filename'],
                original_filename=photo['original_filename'],
                file_size=photo['file_size'],
                content_type=photo['content_type'],
                uploaded_at=photo['uploaded_at'],
                url=f"/api/photos/file/{photo['filename']}",
                thumbnail_url=f"/api/photos/thumbnail/{thumbnail_filename}" if thumbnail_path.exists() else f"/api/photos/file/{photo['filename']}"
            ))
        
        return photo_responses
        
    except Exception as e:
        logging.error(f"Error fetching photos: {e}")
        raise HTTPException(status_code=500, detail="Error fetching photos")

@api_router.get("/photos/file/{filename}")
async def get_photo_file(filename: str):
    """Serve photo files"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return FileResponse(file_path)

@api_router.get("/photos/thumbnail/{filename}")
async def get_photo_thumbnail(filename: str):
    """Serve photo thumbnails"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        # Fallback to original file
        original_filename = filename.replace("thumb_", "").replace(".jpg", f".{filename.split('_')[-1].split('.')[0]}")
        original_path = UPLOAD_DIR / original_filename
        if original_path.exists():
            return FileResponse(original_path)
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    return FileResponse(file_path)

@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str):
    """Delete a photo (admin function)"""
    try:
        # Find photo in database
        photo = await db.photos.find_one({"id": photo_id})
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Delete files
        file_path = UPLOAD_DIR / photo['filename']
        if file_path.exists():
            file_path.unlink()
        
        # Delete thumbnail
        thumbnail_filename = f"thumb_{photo['filename'].replace(photo['filename'].split('.')[-1], 'jpg')}"
        thumbnail_path = UPLOAD_DIR / thumbnail_filename
        if thumbnail_path.exists():
            thumbnail_path.unlink()
        
        # Delete from database
        await db.photos.delete_one({"id": photo_id})
        
        return {"message": "Photo deleted successfully"}
        
    except Exception as e:
        logging.error(f"Error deleting photo: {e}")
        raise HTTPException(status_code=500, detail="Error deleting photo")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
