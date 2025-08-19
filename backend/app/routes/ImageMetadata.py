# ImageMetadata.py
import base64
import contextlib
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone
from uuid import uuid4
from werkzeug.utils import secure_filename
from urllib.parse import urlparse
import os
import io
import requests
import mimetypes
from openai import OpenAI

from models.models import ImageMetadata    # your SQLAlchemy model
from database import SessionLocal, IMAGE_FOLDER  # DB session + image folder
import base64

image_bp = Blueprint("image_bp", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

def allowed_file_ext(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower().lstrip(".")
    return ext in ALLOWED_EXTENSIONS

def ext_from_content_type(content_type: str) -> str:
    if not content_type:
        return ""
    ext = mimetypes.guess_extension(content_type.split(";")[0].strip())
    
    return ext.lstrip(".") if ext else ""

def filename_for(ext: str) -> str:
    # unique filename: uuid + timestamp
    #return secure_filename(f"{uuid4().hex}_{datetime.now(timezone.utc)}.{ext}")
    # only timestamp
    return secure_filename(f"{datetime.now(timezone.utc)}.{ext}")

@image_bp.route("/", methods=["GET"])
def list_images():
    session = SessionLocal()
    try:
        images = session.query(ImageMetadata).order_by(ImageMetadata.CreatedAt.desc()).all()
        result = []
        base_url = request.host_url.rstrip("/")  # e.g., http://127.0.0.1:5001
        for img in images:
            # If FilePath stores absolute path, extract basename
            filename = os.path.basename(img.FilePath) if img.FilePath else ""
            result.append({
                "id": img.Id,
                "prompt": img.Prompt,
                "filename": filename,
                "createdAt": img.CreatedAt.isoformat() if img.CreatedAt else None,
                # public URL for the frontend to load
                "url": f"{base_url}/{img.FilePath.replace(os.sep, '/')}",
            })
        return jsonify(result)
    finally:
        session.close()

@image_bp.route("/upload", methods=["POST"])
def upload_image():
    """
    Accept either:
    - JSON: { "imageUrl": "...", "prompt": "..." }
    - multipart/form-data: file -> 'file', and 'prompt' field
    """
    prompt = None
    file_bytes = None
    ext = None

    # 1) multipart/form-data upload (direct file)
    if "file" in request.files:
        uploaded = request.files["file"]
        prompt = request.form.get("prompt", "")
        if uploaded.filename == "":
            return jsonify({"error": "No file selected"}), 400
        # determine extension from filename
        if not allowed_file_ext(uploaded.filename):
            return jsonify({"error": "Unsupported file type"}), 400
        ext = os.path.splitext(uploaded.filename)[1].lstrip(".").lower()
        file_bytes = uploaded.read()

    # 2) JSON with imageUrl (download remote)
    else:
        data = request.get_json(silent=True) or {}
        image_url = data.get("imageUrl")
        prompt = data.get("prompt", "")
        if not image_url:
            return jsonify({"error": "Missing imageUrl or file"}), 400

        # Download
        try:
            resp = requests.get(image_url, timeout=30)
            if resp.status_code != 200:
                return jsonify({"error": "Failed to download image from URL", "status": resp.status_code}), 502
            file_bytes = resp.content

            # try to get extension from URL path first
            parsed = urlparse(image_url)
            url_ext = os.path.splitext(parsed.path)[1].lstrip(".").lower()
            if url_ext and url_ext in ALLOWED_EXTENSIONS:
                ext = url_ext
            else:
                # fallback to Content-Type header
                ext = ext_from_content_type(resp.headers.get("content-type"))
                if not ext or ext not in ALLOWED_EXTENSIONS:
                    # final fallback
                    ext = "png"
        except requests.RequestException as e:
            return jsonify({"error": "Error fetching image", "detail": str(e)}), 502

    # safety checks
    if not file_bytes:
        return jsonify({"error": "No file data found"}), 400
    if not ext:
        ext = "png"

    # ensure image folder exists
    #os.makedirs(IMAGE_FOLDER, exist_ok=True)

    # create filename and save file
    filename = filename_for(ext)
    relative_path = os.path.join("static", "images", filename)
    absolute_path = os.path.join(current_app.root_path, relative_path)
    
    # Ensure images folder exists
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    try:
        with open(absolute_path, "wb") as f:
            f.write(file_bytes)
    except OSError as e:
        return jsonify({"error": "Failed to save file", "detail": str(e)}), 500

    # Save metadata in DB (store full path or just filename depending on your model)
    session = SessionLocal()
    try:
        # If your model's FilePath is meant to store full path, use file_path.
        # If you prefer to store just filename, change to filename.
        image = ImageMetadata(Prompt=prompt, FilePath=relative_path)
        session.add(image)
        session.commit()
        # build response
        saved = {
            "id": image.Id,
            "prompt": image.Prompt,
            "filename": os.path.basename(image.FilePath),
            "createdAt": image.CreatedAt.isoformat() if image.CreatedAt else None,
            "url": f"/image/{os.path.basename(image.FilePath)}"
        }
        #return jsonify({"message": "Image saved", "image": saved}), 201
        
        base_url = request.host_url.rstrip("/")  # e.g., http://127.0.0.1:5001
        return jsonify({
            "message": "Image saved successfully",
            "url": f"{base_url}/{relative_path.replace(os.sep, '/')}" }), 201
        
    except SQLAlchemyError as e:
        session.rollback()
        # delete the file we wrote to disk because DB failed
        with contextlib.suppress(OSError):
            os.remove(absolute_path)
        return jsonify({"error": "Database error", "detail": str(e)}), 500
    finally:
        session.close()

@image_bp.route("/uploads", methods=["POST"])
def upload_images():
    prompt = request.form.get("prompt", "")
    files = request.files.getlist("files")  # multiple files

    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    for file in files:
        ext = os.path.splitext(file.filename)[1].lstrip(".").lower()
        filename = filename_for(ext)
        relative_path = os.path.join("static", "images", filename)
        absolute_path = os.path.join(current_app.root_path, relative_path)
        file.save(absolute_path)

        # Save to DB
        img = ImageMetadata(Prompt=prompt, FilePath=relative_path)
        session = SessionLocal()
        session.add(img)
        session.commit()
        session.close()

    return jsonify({"message": f"{len(files)} images uploaded successfully!"})


@image_bp.route("/edit-image", methods=["POST"])
def edit_image():
    try:
        # Get files from the form
        image_file = request.files.get("image")
        #mask_file = request.files.get("mask")  # optional
        prompt = request.form.get("prompt")
        client = OpenAI(api_key=os.getenv("ChatGPT_API_KEY"))

        if not image_file:
            return jsonify({"error": "Main image is required"}), 400

        image_bytes = io.BytesIO(image_file.read())
        image_bytes.name = image_file.filename 
        
        # Prepare kwargs only if mask exists
        edit_args = {
            "model": "gpt-image-1",
            "image": image_bytes,  
            "prompt": prompt,
            "size": "1024x1024"
        }

        try:
            response = client.images.edit(**edit_args)
        except Exception as e:
            return jsonify({"error": "Failed to save file", "detail": e.message}), 500
        
        # Extract base64 image data
        image_base64 = response.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)
        
        # create filename and save file
        ext = "png" 
        filename = filename_for(ext)
        relative_path = os.path.join("static", "images", filename)
        absolute_path = os.path.join(current_app.root_path, relative_path)
        
        # Ensure images folder exists
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
        try:
            with open(absolute_path, "wb") as f:
                f.write(image_bytes)
        except OSError as e:
            return jsonify({"error": "Failed to save file", "detail": str(e)}), 500

        # Save metadata in DB (store full path or just filename depending on your model)
        session = SessionLocal()
        image = ImageMetadata(Prompt=prompt, FilePath=relative_path)
        session.add(image)
        session.commit()

        base_url = request.host_url.rstrip("/") 
        return jsonify({"image_url": f"{base_url}/{relative_path.replace(os.sep, '/')}"})
            

    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500


@image_bp.route("/<filename>", methods=["GET"])
def serve_image(filename):
    # Serve the file saved in IMAGE_FOLDER by filename
    return send_from_directory(IMAGE_FOLDER, filename)
