import jwt

from functools import wraps
from flask import request, jsonify, current_app


def require_access_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        # Get Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization header is missing"
            }), 401

        # Make sure it uses Bearer authentication
        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Invalid Authorization header"
            }), 401

        # Extract token
        token = auth_header[7:].strip()

        if not token:
            return jsonify({
                "success": False,
                "message": "Access token is missing"
            }), 401

        try:
            # Validate JWT
            payload = jwt.decode(
                token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"],
                issuer=current_app.config["JWT_ISSUER"],
                audience=current_app.config["JWT_AUDIENCE"]
            )

            # Token is valid.
            # Make decoded claims available to the endpoint.
            request.user = payload
            #print(request.user)

        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Access token has expired"
            }), 401

        except jwt.InvalidIssuerError:
            return jsonify({
                "success": False,
                "message": "Invalid token issuer"
            }), 401

        except jwt.InvalidAudienceError:
            return jsonify({
                "success": False,
                "message": "Invalid token audience"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "message": "Invalid access token"
            }), 401

        # Token is valid → execute the actual endpoint
        return func(*args, **kwargs)

    return wrapper