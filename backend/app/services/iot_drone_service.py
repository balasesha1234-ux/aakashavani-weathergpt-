from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import random

class IoTDroneService:
    """Phase 3: Autonomous Village IoT Sirens, PA Loudspeakers & Drone Survey Engine."""

    @staticmethod
    def get_village_sirens(district: str) -> List[Dict[str, Any]]:
        """Returns registered solar-powered Gram Panchayat siren nodes for a district."""
        return [
            {
                "node_id": f"SIREN-{district.upper()[:3]}-01",
                "village": f"{district} North Gram Panchayat",
                "location": {"lat": 19.82, "lon": 85.84},
                "status": "ARMED_ONLINE",
                "solar_battery_pct": 94,
                "decibel_rating": "130 dB (3.5 km radius)",
                "last_heartbeat": datetime.now(timezone.utc).isoformat(),
                "mesh_hops": 1
            },
            {
                "node_id": f"SIREN-{district.upper()[:3]}-02",
                "village": f"{district} Coastal Fishery Wharf",
                "location": {"lat": 19.79, "lon": 85.81},
                "status": "ARMED_ONLINE",
                "solar_battery_pct": 88,
                "decibel_rating": "140 dB (5.0 km coastal siren)",
                "last_heartbeat": datetime.now(timezone.utc).isoformat(),
                "mesh_hops": 2
            },
            {
                "node_id": f"SIREN-{district.upper()[:3]}-03",
                "village": f"{district} South Agrarian Cluster",
                "location": {"lat": 19.75, "lon": 85.78},
                "status": "ARMED_ONLINE",
                "solar_battery_pct": 91,
                "decibel_rating": "125 dB (2.5 km radius)",
                "last_heartbeat": datetime.now(timezone.utc).isoformat(),
                "mesh_hops": 2
            }
        ]

    @staticmethod
    def trigger_village_siren(district: str, hazard_type: str = "CYCLONE", pattern: str = "EVACUATION_WAIL") -> Dict[str, Any]:
        """Triggers solar siren & loudspeaker emergency broadcast across village nodes."""
        now_iso = datetime.now(timezone.utc).isoformat()
        
        loudspeaker_scripts = {
            "CYCLONE": "सावधान! मौसम विभाग द्वारा अत्यंत तीव्र चक्रवात चेतावनी जारी की गई है। सभी ग्रामीण तुरंत पक्के शरण स्थल की ओर प्रस्थान करें।",
            "FLOOD": "सावधान! नदी का जलस्तर खतरे के निशान से ऊपर पहुंच गया है। निचले इलाकों को तुरंत खाली करें।",
            "THUNDERSTORM": "सावधान! आकाशीय बिजली और तीव्र आंधी का खतरा। पेड़ों और बिजली के खंभों के नीचे न खड़े हों।"
        }

        return {
            "status": "SIREN_ACTIVATED",
            "district": district,
            "hazard_type": hazard_type,
            "siren_pattern": pattern,
            "decibel_output": "135 dB (High Intensity)",
            "activated_at": now_iso,
            "activated_nodes_count": 3,
            "loudspeaker_audio_script": loudspeaker_scripts.get(hazard_type, loudspeaker_scripts["CYCLONE"]),
            "relay_protocol": "LoRaWAN 868MHz Mesh + GSM Fallback",
            "ndma_cap_event_code": "IN-MET-CYCLONE-RED"
        }

    @staticmethod
    def run_drone_spectral_survey(district: str, survey_hectares: int = 150) -> Dict[str, Any]:
        """Simulates autonomous multi-spectral drone post-hazard damage survey with NDVI/NDWI indexing."""
        return {
            "mission_status": "SURVEY_COMPLETED",
            "district": district,
            "survey_area_hectares": survey_hectares,
            "drone_model": "Aakasha-Suraksha Hexacopter v3 (RTK-GPS)",
            "flight_altitude_m": 120,
            "optical_resolution_cm_per_pixel": 3.2,
            "spectral_indices": {
                "ndvi_mean": 0.42,
                "ndvi_pre_disaster": 0.78,
                "vegetation_loss_pct": 46.1,
                "ndwi_mean_water_index": 0.64,
                "submerged_farmland_hectares": 68.5,
                "soil_erosion_risk": "HIGH"
            },
            "damage_classification": {
                "severe_crop_damage_pct": 45.7,
                "moderate_waterlogging_pct": 32.1,
                "intact_cropland_pct": 22.2
            },
            "pmfby_loss_report_generated": True,
            "gis_geotiff_download_url": f"https://cdn.aakashavani.gov.in/drone/orthomosaic_{district.lower()}_spectral.tif"
        }

    @staticmethod
    def get_ndma_cap_feed(district: str) -> Dict[str, Any]:
        """Returns structured NDMA Common Alerting Protocol (CAP-CP) XML/JSON payload."""
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "identifier": f"IN-NDMA-CAP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-0921",
            "sender": "imd_cap_feed@imd.gov.in",
            "sent": now_iso,
            "status": "Actual",
            "msgType": "Alert",
            "scope": "Public",
            "info": {
                "category": "Met",
                "event": "Severe Cyclonic Storm Warning",
                "urgency": "Immediate",
                "severity": "Extreme",
                "certainty": "Observed",
                "eventCode": [{"valueName": "SAME", "value": "SVR"}],
                "headline": f"Extreme Weather Warning for {district} Coastal Belt",
                "description": f"Gale wind speeds up to 130 km/h with heavy storm surge expected in {district}.",
                "instruction": "Suspend fishing operations and evacuate low-lying coastal flood zones.",
                "area": {
                    "areaDesc": f"Coastal Districts of {district} & Adjacent Marine Sector",
                    "polygon": "19.78,85.80 19.85,85.88 19.72,85.92 19.68,85.75 19.78,85.80"
                }
            }
        }
