import asyncio
import time
from app.services.weather_service import WeatherService

async def main():
    print("Testing In-Memory Weather Caching...")
    t0 = time.time()
    r1 = await WeatherService.get_live_weather(17.385, 78.486)
    d1 = int((time.time() - t0) * 1000)
    print(f"Call 1 (Network Fetch): {d1} ms | Cache Hit: {r1.get('cache_hit', False)}")

    t1 = time.time()
    r2 = await WeatherService.get_live_weather(17.385, 78.486)
    d2 = int((time.time() - t1) * 1000)
    print(f"Call 2 (In-Memory Cache): {d2} ms | Cache Hit: {r2.get('cache_hit', False)}")

    speedup = round(d1 / max(d2, 1), 1)
    print(f"Speedup Factor: {speedup}x")

if __name__ == "__main__":
    asyncio.run(main())
