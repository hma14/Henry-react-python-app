
from dotenv import load_dotenv
import base64
from database import SessionLocal, IMAGE_FOLDER  # DB session + image folder
from models.models import ImageMetadata    # your SQLAlchemy model
import requests
import uuid
import os
from openai import OpenAI
from flask import Blueprint, request, jsonify, send_from_directory, current_app, Response
from datetime import datetime, timezone
from flask import current_app


import json
import re

def parse_error_message(error_string):
    try:
        # Remove the "Error code: <number> - " prefix
        json_string = re.sub(r'^Error code: \d+ - ', '', error_string.message)
        # Replace single quotes with double quotes and None with null
        json_string = json_string.replace("'", '"').replace('None', 'null')
        # Parse the JSON string
        error_obj = json.loads(json_string)
        # Return the nested message
        return error_obj['error']['message']
    except (json.JSONDecodeError, KeyError) as e:
        # Fallback if parsing fails or key is missing
        return 'An unexpected error occurred'

def create_openai_image(prompt) -> Response:
    
    try:        
        load_dotenv(override=True)
        api_key = os.getenv("OPENAI_API_KEY")
        client = OpenAI(api_key=api_key)
        response = client.images.generate(
            prompt=prompt,
            model="gpt-image-1.5",
            n=1,
            size="1024x1024"
        )
        b64_image = response.data[0].b64_json     
               
        #b64_image = read_tempdata("tempdata.txt")
        
        if b64_image is None:
            raise ValueError("b64_image is null")

        # decode base64
        image_bytes = base64.b64decode(b64_image)

        # create a unique filename
        image_folder = os.path.join(current_app.root_path, "static", "images")
        os.makedirs(image_folder, exist_ok=True)

        # Create unique filename
        filename = f"{datetime.now().strftime('%Y-%m-%d_%H%M%S.%f')}.png"
        relative_path = os.path.join("static", "images", filename)
        absolute_path = os.path.join(image_folder, filename)
                
        # save image file
        with open(absolute_path, "wb") as f:
            f.write(image_bytes)
            
        # Save metadata in DB (store full path or just filename depending on your model)
        session = SessionLocal()
        image = ImageMetadata(Prompt=prompt, FilePath=relative_path)
        session.add(image)
        session.commit()
        session.close()

        base_url = request.host_url.rstrip("/") 
        return jsonify({"image_url": f"{base_url}/{relative_path.replace(os.sep, '/')}"})
    
    except Exception as e:
        error_string = parse_error_message(e)
        return jsonify({"error": error_string})


def read_tempdata(datafile):
    # Build full path to the file
    file_path = os.path.join(
        current_app.root_path,
        "static",
        "images",
        datafile, #"tempdata.txt"
    )

    # Read the file
    try:
        with open(file_path, "r") as f:
            data = f.read()
        return data
    except FileNotFoundError:
        return "tempdata.txt not found", 404