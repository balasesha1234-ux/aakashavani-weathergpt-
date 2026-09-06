import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    High-performance sliding-window in-memory rate limiter.
    Protects against Denial of Service (DoS), brute force, and rapid LLM token depletion.
    """
    def __init__(self, app, default_limit: int = 150, window_seconds: int = 60):
        super().__init__(app)
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        # Storage: ip -> list of epoch timestamps
        self.requests = defaultdict(list)
        self.last_cleanup = time.time()
        
        # Endpoint-specific stricter limits
        self.route_limits = {
            "/api/chat": 35,          # 35 queries/minute for AI chat
            "/api/telecom": 60,       # 60 calls/minute for SMS & IVR webhooks
            "/api/emergency": 100     # 100 calls/minute for emergency delta
        }

    def _cleanup_old_records(self, now: float):
        """Periodically purge entries older than window_seconds to prevent memory growth."""
        if now - self.last_cleanup > 300:  # Every 5 minutes
            cutoff = now - self.window_seconds
            stale_ips = []
            for ip, timestamps in self.requests.items():
                self.requests[ip] = [ts for ts in timestamps if ts > cutoff]
                if not self.requests[ip]:
                    stale_ips.append(ip)
            for ip in stale_ips:
                del self.requests[ip]
            self.last_cleanup = now

    async def dispatch(self, request: Request, call_next):
        # Exclude static assets and health checks from rate limiting
        path = request.url.path
        if not path.startswith("/api") or path in ("/api", "/api/status", "/api/health"):
            return await call_next(request)

        # Extract client IP (respecting reverse proxies like Nginx X-Forwarded-For)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"

        now = time.time()
        self._cleanup_old_records(now)

        # Determine limit for this path
        limit = self.default_limit
        for route_prefix, custom_limit in self.route_limits.items():
            if path.startswith(route_prefix):
                limit = custom_limit
                break

        # Filter timestamps within current sliding window
        window_start = now - self.window_seconds
        active_requests = [ts for ts in self.requests[client_ip] if ts > window_start]
        self.requests[client_ip] = active_requests

        if len(active_requests) >= limit:
            retry_after = int(self.window_seconds - (now - active_requests[0]))
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "status_code": 429,
                    "detail": f"Request quota exceeded ({limit} req/{self.window_seconds}s). Please slow down.",
                    "retry_after_seconds": max(1, retry_after)
                },
                headers={
                    "Retry-After": str(max(1, retry_after)),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0"
                }
            )

        # Record this request
        self.requests[client_ip].append(now)
        
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(self.requests[client_ip])))
        return response
