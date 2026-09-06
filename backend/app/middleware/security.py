import html
import re
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

def sanitize_string(text: str, max_length: int = 1500) -> str:
    """
    Sanitizes user input string against XSS, HTML injection, and control characters.
    Truncates to max_length to prevent payload exhaustion attacks.
    """
    if not text:
        return ""
    # Strip null bytes and dangerous control characters
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', str(text))
    # Escape HTML special characters (&, <, >, ", ')
    escaped = html.escape(cleaned.strip())
    return escaped[:max_length]

def validate_coordinates(lat: float, lon: float) -> tuple[float, float]:
    """
    Validates that latitude is within [-90, 90] and longitude is within [-180, 180].
    Clamps out-of-range coordinates safely to prevent geography engine panics.
    """
    try:
        lat_val = float(lat)
        lon_val = float(lon)
        lat_clamped = max(-90.0, min(90.0, lat_val))
        lon_clamped = max(-180.0, min(180.0, lon_val))
        return round(lat_clamped, 6), round(lon_clamped, 6)
    except (ValueError, TypeError):
        return 20.7453, 78.6022  # Fallback to India central coordinates (Wardha)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects enterprise defense-in-depth HTTP security headers on all HTTP responses.
    Mitigates Clickjacking, MIME-sniffing, XSS, and unauthorized framing.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent Clickjacking / Framing
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        
        # Legacy XSS Filter trigger for older user agents
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer Policy to prevent data leakage across origins
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Restrict hardware device access (Microphone & Geolocation allowed for self)
        response.headers["Permissions-Policy"] = "microphone=(self), geolocation=(self), camera=()"
        
        # Remove server identity header to obscure runtime details
        if "server" in response.headers:
            del response.headers["server"]
            
        return response
