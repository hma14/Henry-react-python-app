
from dotenv import load_dotenv
import os
from openai import OpenAI
from flask import jsonify


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

def create_openai_image(prompt):
       
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)

    try:
        response = client.images.generate(
            prompt=prompt,
            model="dall-e-3",
            n=1,
            size="1024x1024"
        )
        image_url = response.data[0].url
        return jsonify({"imageUrl": image_url})
    except Exception as e:
        error_string = parse_error_message(e)
        #return jsonify({"error": error_string}), 500
        return error_string, 500

