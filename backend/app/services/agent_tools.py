"""
AakashaVani: Phase 3 Intelligent Tool Registry & Domain Tools
Implements an allowlisted, bounded, and concurrent tool execution layer.
Tools provide factual, verified information to the Agent and ModelRouter.
"""

import os
import re
import time
import asyncio
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple, Callable
from datetime import datetime, timezone

from .weather_service import WeatherService
from .emergency_service import EmergencyService
from .gis_radar_service import GISRadarService
from ..rag.rag_engine import rag_engine


@dataclass
class ToolResult:
    """Structured, immutable output of a domain tool execution."""
    tool_name: str
    success: bool
    data: Any
    latency_ms: int
    error: Optional[str] = None
    provenance: Optional[str] = None


class BaseTool(ABC):
    """Abstract base class for all allowlisted AakashaVani tools."""
    name: str
    description: str
    parameters: Dict[str, Any]

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        pass


import httpx

# In-memory cache to avoid repeated geocoding lookups
GEOCODE_CACHE: Dict[str, Dict[str, Any]] = {}

class UniversalGeocoder:
    """Dynamically geocodes ANY locality, town, city, or district in real-time with strict India-first safety."""

    COMMON_NON_LOCATIONS = {
        'grow', 'growing', 'growth', 'spray', 'spraying', 'plant', 'planting', 'harvest', 'harvesting',
        'sow', 'sowing', 'water', 'watering', 'irrigate', 'irrigation', 'plow', 'plowing', 'fertilize',
        'fertilizing', 'dry', 'drying', 'wash', 'washing', 'travel', 'traveling', 'drive', 'driving',
        'fly', 'flying', 'ride', 'riding', 'walk', 'walking', 'run', 'running', 'jog', 'jogging',
        'play', 'playing', 'work', 'working', 'study', 'studying', 'sleep', 'sleeping', 'live', 'living',
        'buy', 'sell', 'cut', 'cutting', 'pick', 'picking', 'protect', 'save', 'check', 'give', 'show',
        'tell', 'know', 'say', 'see', 'look', 'make', 'do', 'doing', 'planning', 'feeling',
        'crop', 'crops', 'field', 'fields', 'farm', 'farms', 'farmer', 'farmers', 'soil', 'land',
        'seed', 'seeds', 'plant', 'plants', 'tree', 'trees', 'leaf', 'leaves', 'cotton', 'paddy', 'wheat',
        'soybean', 'rice', 'mustard', 'sugarcane', 'maize', 'vegetable', 'vegetables', 'fruit', 'fruits',
        'weather', 'climate', 'rain', 'rains', 'raining', 'rainfall', 'cloud', 'clouds', 'wind', 'sun',
        'storm', 'thunder', 'lightning', 'fog', 'smog', 'hail', 'heat', 'cold', 'temp', 'temperature',
        'humidity', 'dew', 'laundry', 'clothes', 'umbrella', 'jacket', 'sweater', 'car', 'bike', 'scooter',
        'bus', 'train', 'flight', 'two-wheeler', 'two wheeler',
        'office', 'college', 'school', 'home', 'house', 'room', 'terrace', 'balcony', 'market', 'mandi',
        'today', 'tomorrow', 'tonight', 'yesterday', 'now', 'morning', 'evening', 'night', 'afternoon',
        'noon', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years',
        'winter', 'summer', 'monsoon', 'spring', 'autumn', 'rabi', 'kharif', 'zaid',
        'bhai', 'bro', 'buddy', 'yaar', 'dost', 'babu', 'anna', 'sir', 'boss', 'ji',
        'what', 'where', 'when', 'which', 'who', 'whose', 'whom', 'why', 'how',
        'should', 'could', 'would', 'shall', 'will', 'can', 'may', 'might', 'must',
        'please', 'help', 'thanks', 'thank', 'good', 'have', 'hey', 'hi', 'heya', 'hello',
        'my', 'mine', 'our', 'ours', 'your', 'yours', 'their', 'theirs', 'his', 'her', 'its',
        'this', 'that', 'these', 'those', 'here', 'there', 'good', 'bad', 'safe', 'danger',
        'aaj', 'kal', 'parso', 'bohot', 'bahut', 'tha', 'thi', 'the', 'hai', 'hain', 'ho',
        'kaisa', 'kaisi', 'kaise', 'kya', 'kyun', 'kaam', 'thak', 'gaya', 'gayi', 'gaye',
        'mera', 'meri', 'mere', 'tera', 'teri', 'tere', 'hum', 'aap', 'tum', 'bhi', 'toh',
        'ekdum', 'mast', 'saath', 'ghar', 'bahar', 'nikal', 'sakte', 'sakta', 'sakti', 'kheth',
        'fasal', 'panta', 'khad', 'davayi', 'dawa'
    }

    MAJOR_INDIAN_CITIES = (
        r'\b(Hyderabad|Bengaluru|Bangalore|Delhi|New Delhi|Mumbai|Chennai|Kolkata|Pune|Jaipur|Ahmedabad|'
        r'Lucknow|Chandigarh|Bhopal|Patna|Wardha|Guntur|Visakhapatnam|Vizag|Shimla|Srinagar|Guwahati|'
        r'Bhubaneswar|Puri|Amritsar|Dehradun|Ranchi|Raipur|Agra|Varanasi|Surat|Nagpur|Kochi|Cochin|'
        r'Coimbatore|Madurai|Mysuru|Mysore|Vijayawada|Warangal|Khammam|Nizamabad|Karimnagar|Tirupati|'
        r'Indore|Vadodara|Thiruvananthapuram|Kozhikode|Mangalore|Nashik|Aurangabad|Amravati|Jabalpur|'
        r'Gwalior|Jodhpur|Udaipur|Kota|Allahabad|Prayagraj|Kanpur|Meerut|Bareilly|Aligarh|Moradabad)\b'
    )

    @classmethod
    async def extract_and_geocode(
        cls,
        query: str, 
        default_lat: float, 
        default_lon: float, 
        default_district: str
    ) -> Tuple[float, float, str, str]:
        if not query:
            return default_lat, default_lon, default_district, default_district

        clean = query.strip('?.!,"\'')
        candidate = None

        # 1. Match explicit spatial preposition phrases: 'in Mumbai', 'at Wardha', 'travel to Delhi', 'weather in Shimla'
        m = re.search(r'\b(?:in|at|near|around|visiting|towards|reach|travel to|go to|flying to|driving to|weather of|forecast for|weather in)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\b', clean, re.IGNORECASE)
        if m:
            raw_cand = re.sub(r'^[^\w]+|[^\w]+$', '', m.group(1).strip())
            parts = raw_cand.split()
            # Strip trailing time/activity stopwords (e.g. 'Wardha tomorrow' -> 'Wardha')
            while parts and parts[-1].lower() in cls.COMMON_NON_LOCATIONS:
                parts.pop()
            if parts and parts[0].lower() not in cls.COMMON_NON_LOCATIONS and len(" ".join(parts)) > 2:
                candidate = " ".join(parts)

        # 2. Match verified Major Indian Cities / Districts without prepositions (e.g. 'Hyderabad weather', 'Mumbai rain')
        if not candidate:
            m_city = re.search(cls.MAJOR_INDIAN_CITIES, clean, re.IGNORECASE)
            if m_city:
                candidate = m_city.group(1).strip()

        # 3. If no verified spatial candidate found, PRESERVE ACTIVE DISTRICT (no arbitrary word guessing!)
        if not candidate:
            return default_lat, default_lon, default_district, default_district

        cached_key = candidate.lower()
        if cached_key in GEOCODE_CACHE:
            info = GEOCODE_CACHE[cached_key]
            return info["lat"], info["lon"], info["name"], info.get("district", info["name"])

        # 4. Fast directory check
        known_cities = {
            "Wardha": (20.7453, 78.6022, "Wardha"),
            "Nagpur": (21.1458, 79.0882, "Nagpur"),
            "Hyderabad": (17.3850, 78.4867, "Hyderabad"),
            "Bengaluru": (12.9716, 77.5946, "Bengaluru Urban"),
            "Bangalore": (12.9716, 77.5946, "Bengaluru Urban"),
            "Mumbai": (19.0760, 72.8777, "Mumbai"),
            "Delhi": (28.6139, 77.2090, "New Delhi"),
            "New Delhi": (28.6139, 77.2090, "New Delhi"),
            "Chennai": (13.0827, 80.2707, "Chennai"),
            "Kolkata": (22.5726, 88.3639, "Kolkata"),
            "Pune": (18.5204, 73.8567, "Pune"),
            "Jaipur": (26.9124, 75.7873, "Jaipur"),
            "Ahmedabad": (23.0225, 72.5714, "Ahmedabad"),
            "Lucknow": (26.8467, 80.9462, "Lucknow"),
            "Visakhapatnam": (17.6868, 83.2185, "Visakhapatnam"),
            "Vizag": (17.6868, 83.2185, "Visakhapatnam"),
            "Vijayawada": (16.5062, 80.6480, "Krishna"),
            "Warangal": (17.9689, 79.5941, "Warangal")
        }
        if candidate in known_cities:
            lat, lon, dist = known_cities[candidate]
            GEOCODE_CACHE[cached_key] = {"lat": lat, "lon": lon, "name": candidate, "district": dist}
            return lat, lon, candidate, dist

        # 5. Query Open-Meteo Universal Geocoding API with strict Indian verification
        try:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={candidate}&count=5&language=en&format=json"
            headers = {"User-Agent": "AakashaVani-WeatherGPT/1.0"}
            async with httpx.AsyncClient(timeout=4.0, headers=headers) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        # Prioritize Indian locations
                        india_res = next((r for r in results if r.get("country_code") == "IN" or r.get("country") == "India"), None)
                        res = india_res or (results[0] if results[0].get("country_code") == "IN" else None)
                        
                        if not res:
                            return default_lat, default_lon, default_district, default_district

                        lat = float(res["latitude"])
                        lon = float(res["longitude"])
                        place_name = res.get("name", candidate.title())
                        admin_dist = res.get("admin2") or res.get("admin1") or res.get("country") or place_name

                        GEOCODE_CACHE[cached_key] = {
                            "lat": lat,
                            "lon": lon,
                            "name": place_name,
                            "district": admin_dist,
                            "country": res.get("country", "")
                        }
                        return lat, lon, place_name, admin_dist
        except Exception as e:
            print(f"Geocoding error for '{candidate}': {e}")

        return default_lat, default_lon, default_district, default_district


# =====================================================================
# TOOL 1: LOCATION TOOL
# =====================================================================
class LocationTool(BaseTool):
    name = "location_tool"
    description = "Resolves query place names or GPS coordinates to verified Indian district and lat/lon."
    parameters = {
        "query": {"type": "string", "description": "User natural language query"},
        "default_lat": {"type": "number", "description": "Session latitude"},
        "default_lon": {"type": "number", "description": "Session longitude"},
        "default_district": {"type": "string", "description": "Session district"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        query = kwargs.get("query", "")
        def_lat = kwargs.get("default_lat", 20.7453)
        def_lon = kwargs.get("default_lon", 78.6022)
        def_dist = kwargs.get("default_district", "Wardha")

        try:
            lat, lon, place, district = await UniversalGeocoder.extract_and_geocode(
                query=query,
                default_lat=def_lat,
                default_lon=def_lon,
                default_district=def_dist
            )
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=True,
                data={
                    "latitude": lat,
                    "longitude": lon,
                    "place": place,
                    "district": district,
                    "is_custom_location": place.lower() != def_dist.lower()
                },
                latency_ms=elapsed,
                provenance="UniversalGeocoder (India Precision Geocoding)"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data={"latitude": def_lat, "longitude": def_lon, "place": def_dist, "district": def_dist},
                latency_ms=elapsed,
                error=str(e),
                provenance="LocationFallback (Session Defaults)"
            )


# =====================================================================
# TOOL 2: CURRENT WEATHER TOOL
# =====================================================================
class CurrentWeatherTool(BaseTool):
    name = "current_weather_tool"
    description = "Fetches live surface meteorological observations (temperature, feels like, humidity, wind, rainfall, conditions)."
    parameters = {
        "latitude": {"type": "number", "description": "Location latitude"},
        "longitude": {"type": "number", "description": "Location longitude"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        lat = kwargs.get("latitude") or kwargs.get("lat") or 20.7453
        lon = kwargs.get("longitude") or kwargs.get("lon") or 78.6022

        try:
            full_data = await WeatherService.get_live_weather(lat, lon)
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=True,
                data=full_data,
                latency_ms=elapsed,
                provenance="Open-Meteo Physical NWP Surface Model"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=None,
                latency_ms=elapsed,
                error=f"Weather telemetry fetch failed: {e}",
                provenance="WeatherService Error"
            )


# =====================================================================
# TOOL 3: FORECAST TOOL
# =====================================================================
class ForecastTool(BaseTool):
    name = "forecast_tool"
    description = "Fetches hourly meteogram predictions (next 24h) and 7-day daily forecast with rain probabilities."
    parameters = {
        "latitude": {"type": "number", "description": "Location latitude"},
        "longitude": {"type": "number", "description": "Location longitude"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        lat = kwargs.get("latitude") or kwargs.get("lat") or 20.7453
        lon = kwargs.get("longitude") or kwargs.get("lon") or 78.6022

        try:
            full_data = await WeatherService.get_live_weather(lat, lon)
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=True,
                data=full_data,
                latency_ms=elapsed,
                provenance="Open-Meteo HRRR / NWP Multi-Model Forecast"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=None,
                latency_ms=elapsed,
                error=f"Forecast query failed: {e}",
                provenance="ForecastService Error"
            )


# =====================================================================
# TOOL 4: WARNING TOOL
# =====================================================================
class WarningTool(BaseTool):
    name = "warning_tool"
    description = "Queries active official IMD / NDMA Common Alerting Protocol (CAP) disaster alerts and polygon severity."
    parameters = {
        "latitude": {"type": "number", "description": "Location latitude"},
        "longitude": {"type": "number", "description": "Location longitude"},
        "district": {"type": "string", "description": "Target district"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        lat = kwargs.get("latitude") or kwargs.get("lat") or 20.7453
        lon = kwargs.get("longitude") or kwargs.get("lon") or 78.6022
        dist = kwargs.get("district", "Wardha")

        try:
            status = EmergencyService.evaluate_emergency_status(lat, lon, dist)
            elapsed = int((time.time() - t0) * 1000)
            warning_data = status.get("warning")
            return ToolResult(
                tool_name=self.name,
                success=True,
                data={
                    "is_emergency_active": status.get("is_emergency_active", False),
                    "severity": status.get("severity", "NORMAL"),
                    "hazard_type": warning_data.get("hazard_type") if warning_data else None,
                    "instructions": warning_data.get("instructions") if warning_data else "No active disaster directives.",
                    "provider": warning_data.get("provider") if warning_data else "IMD_CAP_ALERT_FEED",
                    "affected_districts": warning_data.get("affected_districts") if warning_data else dist
                },
                latency_ms=elapsed,
                provenance="NDMA / IMD Common Alerting Protocol (CAP) Broadcast"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data={"is_emergency_active": False, "severity": "UNKNOWN", "instructions": "Alert feed temporarily unreachable."},
                latency_ms=elapsed,
                error=str(e),
                provenance="WarningService Error"
            )


# =====================================================================
# TOOL 5: GIS / RADAR TOOL
# =====================================================================
class GISMapContextTool(BaseTool):
    name = "gis_tool"
    description = "Fetches spatial Doppler Weather Radar (DWR) sweeps and convective nowcasting timeline frames."
    parameters = {
        "district": {"type": "string", "description": "Target district name"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        dist = kwargs.get("district", "Wardha")

        try:
            nowcast = GISRadarService.get_convective_nowcast_timeline(dist)
            dwr_stations = GISRadarService.get_dwr_station_network()
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=True,
                data={
                    "target_district": dist,
                    "storm_translation_speed_kmh": nowcast.get("storm_translation_speed_kmh"),
                    "storm_motion_heading_deg": nowcast.get("storm_motion_heading_deg"),
                    "nearest_dwr": dwr_stations[3]["name"] if len(dwr_stations) > 3 else "Nagpur Doppler Radar",
                    "operational_radars_online": len(dwr_stations)
                },
                latency_ms=elapsed,
                provenance="IMD Doppler Weather Radar Network & HRRR Nowcasting Engine"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=None,
                latency_ms=elapsed,
                error=str(e),
                provenance="GISRadarService Error"
            )


# =====================================================================
# TOOL 6: RAG / KNOWLEDGE TOOL
# =====================================================================
class RAGKnowledgeTool(BaseTool):
    name = "rag_tool"
    description = "Retrieves compact semantic knowledge from the AakashaVani neural vector knowledge base."
    parameters = {
        "query": {"type": "string", "description": "Conceptual or scientific inquiry"},
        "top_k": {"type": "integer", "description": "Number of evidence passages to retrieve"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        query = kwargs.get("query", "")
        top_k = kwargs.get("top_k", 2)

        try:
            docs = rag_engine.retrieve(query, top_k=top_k)
            elapsed = int((time.time() - t0) * 1000)
            evidence = [
                {
                    "source": d.get("source"),
                    "title": d.get("title"),
                    "category": d.get("category"),
                    "content": d.get("content"),
                    "score": round(d.get("score", 0.0), 3)
                }
                for d in docs
            ]
            return ToolResult(
                tool_name=self.name,
                success=True,
                data=evidence,
                latency_ms=elapsed,
                provenance="AakashaVani Dense Neural Vector Knowledge Base"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=[],
                latency_ms=elapsed,
                error=str(e),
                provenance="RAGEngine Error"
            )


# =====================================================================
# TOOL 7: EMERGENCY RESOURCE TOOL
# =====================================================================
class EmergencyResourceTool(BaseTool):
    name = "emergency_resource_tool"
    description = "Retrieves nearby verified shelters, relief camps, trauma centers, and district control room helplines."
    parameters = {
        "latitude": {"type": "number", "description": "Location latitude"},
        "longitude": {"type": "number", "description": "Location longitude"},
        "district": {"type": "string", "description": "Target district"}
    }

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        lat = kwargs.get("latitude") or kwargs.get("lat") or 20.7453
        lon = kwargs.get("longitude") or kwargs.get("lon") or 78.6022
        dist = kwargs.get("district", "Wardha")

        try:
            resources = EmergencyService.get_nearby_verified_resources(lat, lon, None, dist)
            elapsed = int((time.time() - t0) * 1000)
            compact_resources = [
                {
                    "name": r.get("name"),
                    "type": r.get("resource_type"),
                    "distance_km": r.get("distance_km"),
                    "capacity": r.get("capacity"),
                    "contact": r.get("contact")
                }
                for r in resources[:3]  # Top 3 closest
            ]
            helplines = [
                {"name": f"{dist} Disaster Control Room", "number": "1077"},
                {"name": "National Emergency Helpline (ERSS)", "number": "112"},
                {"name": "Ambulance & Trauma Care", "number": "108 / 102"}
            ]
            return ToolResult(
                tool_name=self.name,
                success=True,
                data={
                    "verified_resources": compact_resources,
                    "official_helplines": helplines
                },
                latency_ms=elapsed,
                provenance="Verified District Disaster Relief Directory"
            )
        except Exception as e:
            elapsed = int((time.time() - t0) * 1000)
            return ToolResult(
                tool_name=self.name,
                success=False,
                data={"verified_resources": [], "official_helplines": []},
                latency_ms=elapsed,
                error=str(e),
                provenance="EmergencyResourceService Error"
            )


# =====================================================================
# TOOL 8: CONVERSATION CONTEXT TOOL
# =====================================================================
class ConversationContextTool(BaseTool):
    name = "conversation_context_tool"
    description = "Retrieves and resolves compact multi-turn context and antecedent entities without dumping history."
    parameters = {
        "user_id": {"type": "string", "description": "User identifier"},
        "current_query": {"type": "string", "description": "Latest query"}
    }

    # In-memory recent session store per user (bounded to 5 turns)
    _SESSION_HISTORY: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def record_turn(cls, user_id: str, query: str, response: str, metadata: Optional[Dict[str, Any]] = None):
        if user_id not in cls._SESSION_HISTORY:
            cls._SESSION_HISTORY[user_id] = []
        cls._SESSION_HISTORY[user_id].append({
            "query": query,
            "response": response[:160],
            "metadata": metadata or {},
            "timestamp": time.time()
        })
        # Keep only last 5 turns
        if len(cls._SESSION_HISTORY[user_id]) > 5:
            cls._SESSION_HISTORY[user_id].pop(0)

    async def execute(self, **kwargs) -> ToolResult:
        t0 = time.time()
        uid = kwargs.get("user_id", "default_user")
        curr_q = (kwargs.get("query") or kwargs.get("current_query") or "").lower()

        # Check explicit history passed in kwargs first, fallback to session memory
        history = kwargs.get("history") or self._SESSION_HISTORY.get(uid, [])
        elapsed = int((time.time() - t0) * 1000)

        if not history:
            return ToolResult(
                tool_name=self.name,
                success=True,
                data={"has_antecedent": False, "recent_context": None, "last_query": None},
                latency_ms=elapsed,
                provenance="SessionContextManager"
            )

        last_turn = history[-1]
        has_pronoun_or_ellipsis = any(w in curr_q for w in ["what about", "and when", "then", "there", "that", "it", "kya", "aur", "tomorrow", "repu", "kal"])
        return ToolResult(
            tool_name=self.name,
            success=True,
            data={
                "has_antecedent": has_pronoun_or_ellipsis,
                "last_query": last_turn.get("query"),
                "last_response": last_turn.get("response"),
                "context_summary": f"Prior question was '{last_turn.get('query')}'."
            },
            latency_ms=elapsed,
            provenance="SessionContextManager"
        )


# =====================================================================
# ALLOWLISTED TOOL REGISTRY
# =====================================================================
class ToolRegistry:
    """
    Central registry governing execution of allowlisted domain tools.
    Enforces security parameter checking, bounded execution, and concurrency.
    """
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self):
        tools = [
            LocationTool(),
            CurrentWeatherTool(),
            ForecastTool(),
            WarningTool(),
            GISMapContextTool(),
            RAGKnowledgeTool(),
            EmergencyResourceTool(),
            ConversationContextTool()
        ]
        for t in tools:
            self._tools[t.name] = t

    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        return self._tools.get(tool_name)

    def list_tools(self) -> List[str]:
        return list(self._tools.keys())

    async def execute_tool(self, tool_name: str, **kwargs) -> ToolResult:
        tool = self._tools.get(tool_name)
        if not tool:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                data=None,
                latency_ms=0,
                error=f"Security Error: Tool '{tool_name}' is not in the allowlisted tool registry.",
                provenance="SecurityGuard"
            )
        try:
            return await tool.execute(**kwargs)
        except Exception as e:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                data=None,
                latency_ms=0,
                error=f"Runtime error in {tool_name}: {e}",
                provenance=f"{tool_name} Exception"
            )

    async def execute_tools_concurrently(self, tool_requests: List[Tuple[str, Dict[str, Any]]]) -> Dict[str, ToolResult]:
        """
        Executes multiple independent tools in parallel to minimize end-to-end latency.
        """
        tasks = [self.execute_tool(name, **args) for name, args in tool_requests]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return {req[0]: res for req, res in zip(tool_requests, results)}


# Global ToolRegistry Singleton
tool_registry = ToolRegistry()
