import os
import requests
from datetime import datetime, timezone
from flask import current_app
from database import SessionLocal
from models.models import ImageMetadata

def save_ai_image_from_url(image_url: str, prompt: str):
    """Downloads an AI-generated image from a temporary URL and stores it in DB."""
    # Make sure images folder exists
    image_folder = os.path.join(current_app.root_path, "static", "images")
    os.makedirs(image_folder, exist_ok=True)

    # Create unique filename
    filename = f"{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H%M%S.%f')}.png"
    file_path = os.path.join(image_folder, filename)

    # Download the image from OpenAI CDN
    response = requests.get(image_url)
    if response.status_code != 200:
        raise Exception(f"Failed to download AI image: {response.status_code}")

    with open(file_path, "wb") as f:
        f.write(response.content)

    # Save to DB (relative path)
    #rel_path = f"static/images/{filename}"
    rel_path = os.path.join("static", "images", filename)
    session = SessionLocal()
    image_record = ImageMetadata(Prompt=prompt, FilePath=rel_path)
    session.add(image_record)
    session.commit()
    session.close()

    return rel_path
