"""
AakashaVani: Distributed Hybrid Cache Service (Redis + In-Memory Fallback)
Provides non-blocking distributed caching for physical weather telemetry,
rate limiting counters, and session states.

Resilience Guarantee:
- If REDIS_URL is provided and reachable -> Uses Redis (sub-millisecond distributed cache).
- If REDIS_URL is not provided or unreachable -> Seamlessly falls back to in-memory TTL dictionary.
- 0% risk of application downtime or crash if Redis fails.
"""

import os
import json
import time
from typing import Any, Optional, Dict, Tuple

try:
    import redis.asyncio as aioredis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False

class HybridCacheService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "").strip()
        self._redis: Optional[Any] = None
        self._local_cache: Dict[str, Tuple[float, Any]] = {}
        self._is_redis_active = False

    async def _get_redis(self):
        if not HAS_REDIS or not self.redis_url:
            return None
        if self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=2.0,
                    socket_timeout=2.0
                )
                await self._redis.ping()
                self._is_redis_active = True
            except Exception as e:
                self._is_redis_active = False
                self._redis = None
        return self._redis

    async def get(self, key: str) -> Optional[Any]:
        """Fetch value from Redis or fall back to local in-memory cache."""
        r = await self._get_redis()
        if r:
            try:
                val = await r.get(key)
                if val is not None:
                    return json.loads(val)
            except Exception:
                self._is_redis_active = False

        # Local In-Memory Fallback
        if key in self._local_cache:
            exp_time, data = self._local_cache[key]
            if time.time() < exp_time:
                return data
            else:
                del self._local_cache[key]

        return None

    async def set(self, key: str, value: Any, ttl_seconds: int = 180) -> bool:
        """Store serialized value in Redis or local memory with TTL."""
        serialized = json.dumps(value, ensure_ascii=False)
        r = await self._get_redis()
        if r:
            try:
                await r.set(key, serialized, ex=ttl_seconds)
                return True
            except Exception:
                self._is_redis_active = False

        # Local In-Memory Fallback
        self._local_cache[key] = (time.time() + ttl_seconds, value)
        return True

    async def health_check(self) -> Dict[str, Any]:
        """Returns live cache engine status."""
        r = await self._get_redis()
        if r:
            try:
                await r.ping()
                return {
                    "engine": "Redis (Distributed Cluster)",
                    "status": "HEALTHY",
                    "connected": True,
                    "redis_url": self.redis_url.split("@")[-1] if "@" in self.redis_url else "configured"
                }
            except Exception as e:
                pass

        return {
            "engine": "In-Memory RAM (Local Fallback)",
            "status": "HEALTHY",
            "connected": False,
            "cached_keys_count": len(self._local_cache)
        }

# Global Singleton Instance
cache_service = HybridCacheService()
