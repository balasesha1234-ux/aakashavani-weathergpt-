"""
AakashaVani: Curated Meteorological, ICAR Agromet & NDMA Disaster Knowledge Base for RAG
"""

RAG_KNOWLEDGE_DOCUMENTS = [
    {
        "id": "ICAR_COTTON_001",
        "category": "AGROMET_ICAR",
        "title": "ICAR Cotton Pest & Weather-Triggered Spraying Protocol",
        "source": "ICAR-CICR Agromet Advisory Bulletin Sec 4.2",
        "tags": ["cotton", "pesticide", "spray", "pink bollworm", "rain wash-off", "wardha", "adilabad", "vidarbha", "వరి", "పత్తి"],
        "content": "Cotton (Gossypium): For pink bollworm and sucking pests (aphids, jassids), avoid chemical pesticide application if rainfall exceeding 5 mm or wind speed above 15 km/h is forecast within 24 hours. The minimum rain-free wash-off window required after application is 4 hours. If relative humidity exceeds 80% with cloudy skies, prioritize neem-based formulations over systemic organophosphates."
    },
    {
        "id": "ICAR_PADDY_002",
        "category": "AGROMET_ICAR",
        "title": "ICAR Paddy Blast & Humidity Disease Trigger Guidelines",
        "source": "ICAR-IIRR Rice Research Advisory Guide",
        "tags": ["paddy", "rice", "blast", "fungal", "humidity", "sheath blight", "guntur", "godavari", "thanjavur"],
        "content": "Paddy (Oryza sativa): Fungal blast (Magnaporthe oryzae) and sheath blight development peak when ambient relative humidity remains above 85% accompanied by nighttime temperatures between 20°C and 26°C. During persistent overcast or humid conditions, drain excess stagnant water from field plots and apply Tricyclazole 75 WP at 0.6 g/L during clear morning hours."
    },
    {
        "id": "ICAR_WHEAT_003",
        "category": "AGROMET_ICAR",
        "title": "ICAR Wheat Critical Stage Irrigation & Western Disturbance Rules",
        "source": "ICAR-IIWBR Karnal Agromet Handbook",
        "tags": ["wheat", "irrigation", "crown root", "punjab", "haryana", "western disturbance", "rain"],
        "content": "Wheat (Triticum aestivum): Crown Root Initiation (CRI) occurring 21-25 days after sowing is the most critical moisture-sensitive phase. Do not irrigate if an active Western Disturbance is forecast to bring >12 mm rainfall within 48 hours to prevent lodging and root asphyxiation."
    },
    {
        "id": "NDMA_CYCLONE_004",
        "category": "DISASTER_NDMA",
        "title": "NDMA Cyclone & Severe Weather Evacuation Protocol",
        "source": "NDMA National Disaster Management Guidelines (SOP-CYC-2024)",
        "tags": ["cyclone", "evacuation", "red alert", "shelter", "wind", "storm surge", "coastal", "odisha", "andhra"],
        "content": "NDMA Cyclone SOP: When an IMD Red Alert (sustained winds > 65 km/h or rainfall > 204.4 mm/24h) is active, all coastal fishing, outdoor construction, and transit are prohibited. Residents in katcha houses within 5 km of coastlines or flood plains must evacuate immediately to designated reinforced pucca cyclone shelters. Keep 72 hours of dry rations, battery torches, and waterproof emergency document pouches."
    },
    {
        "id": "NDMA_LIGHTNING_005",
        "category": "DISASTER_NDMA",
        "title": "IMD/NDMA Lightning & Thunderstorm 30-30 Life Safety Rule",
        "source": "IMD Damini Lightning Warning Directives",
        "tags": ["lightning", "thunderstorm", "squall", "tree shelter", "safety", "damini", "30-30 rule"],
        "content": "Lightning Safety Protocol (30-30 Rule): If the time elapsed between seeing a lightning flash and hearing thunder is less than 30 seconds, lightning is within 10 km—seek enclosed concrete building shelter immediately. Never take shelter under isolated tall trees, open metal tin sheds, or near high-tension electrical poles. Wait 30 full minutes after the final thunderclap before returning outdoors."
    },
    {
        "id": "NDMA_HEATWAVE_006",
        "category": "DISASTER_NDMA",
        "title": "NDMA Heatwave Action Plan & Vulnerability Tiers",
        "source": "NDMA National Heatwave Action Plan Tier 1-3",
        "tags": ["heatwave", "temperature", "heat stroke", "summer", "hydration", "ors", "40c", "45c"],
        "content": "Heatwave Action Matrix: Red Alert is triggered when maximum temperature reaches >= 45°C or exceeds normal by > 6.0°C for 2 consecutive days. Avoid direct sunlight between 12:00 PM and 3:30 PM. Drink plenty of water, ORS solution, coconut water, or buttermilk. High-risk individuals (elderly, infants, outdoor laborers) must remain in ventilated, shaded environments."
    },
    {
        "id": "URBAN_FLOOD_007",
        "category": "URBAN_METEOROLOGY",
        "title": "Urban Road Inundation & Commuter Safety Thresholds",
        "source": "Ministry of Earth Sciences (MoES) Urban Hydrology Guidelines",
        "tags": ["flood", "waterlogging", "road", "commute", "umbrella", "underpass", "manikonda", "hyderabad", "mumbai"],
        "content": "Urban Flood & Road Safety: Standing flood depth exceeding 30 cm (1 foot) can stall passenger cars, and depth > 45 cm (1.5 feet) can cause vehicle floating and loss of steering control. Avoid driving into submerged underpasses during high-intensity rainfall (> 20 mm/hr). Carry an umbrella and wind-resistant rain poncho if precipitation probability exceeds 60%."
    },
    {
        "id": "INCOIS_MARINE_008",
        "category": "OCEAN_MARINE_INCOIS",
        "title": "INCOIS Ocean State & Fishermen Sea-Safety Alert Thresholds",
        "source": "INCOIS Coastal Ocean Information Service Advisory 12",
        "tags": ["marine", "fishing", "fisherman", "boat", "waves", "swell", "sea", "squall", "vizag", "bay of bengal", "arabian sea"],
        "content": "Marine Safety Protocol (INCOIS): Small motorized artisanal fishing boats (< 12 meters) must suspend sea operations when significant wave height exceeds 2.5 meters or wind gusts exceed 45 km/h (24 knots). When High Swell Surge warnings are issued, keep anchored boats lashed to harbor bulkheads and maintain continuous monitoring on VHF Channel 16 / NAVTEX emergency frequencies."
    },
    {
        "id": "ICAR_SOYBEAN_009",
        "category": "AGROMET_ICAR",
        "title": "ICAR Soybean Waterlogging & Aeration Drainage Directive",
        "source": "ICAR-IISR Indore National Soybean Advisory",
        "tags": ["soybean", "waterlogging", "drainage", "yellowing", "vidarbha", "madhya pradesh", "maharashtra", "rain"],
        "content": "Soybean (Glycine max): Highly vulnerable to waterlogging during germination and pod-filling phases. If standing water persists beyond 36 hours, root respiration stops, causing leaf chlorosis and up to 40% yield decline. Farmers must excavate broad-bed furrow (BBF) or open field drainage channels immediately before forecast heavy showers (> 30 mm)."
    },
    {
        "id": "GSI_LANDSLIDE_010",
        "category": "DISASTER_GSI_IMD",
        "title": "Geological Survey of India Hill Slope Landslide Rainfall Triggers",
        "source": "GSI Landslide Early Warning System (LEWS) Protocol",
        "tags": ["landslide", "hills", "slope", "wayanad", "shimla", "uttarakhand", "kerala", "mudslide", "rain"],
        "content": "Hill Slope Hazard Trigger: In geologically sensitive hill tracts (Western Ghats, Nilgiris, Himalayas), cumulative antecedent rainfall exceeding 150 mm over 72 hours combined with instant precipitation > 20 mm/hr destabilizes topsoil shear strength. Inhabitants of slope toes and riverbanks must evacuate to designated high-ground community centers upon IMD Orange or Red alerts."
    },
    {
        "id": "DGCA_AVIATION_011",
        "category": "AVIATION_METEOROLOGY",
        "title": "IMD-DGCA Dense Fog & Runway Visual Range (RVR) Operations",
        "source": "IMD Aviation Weather Division Circular MET-2024",
        "tags": ["aviation", "flight", "fog", "runway", "rvr", "delhi", "del", "jaipur", "smog", "visibility"],
        "content": "Aviation Low Visibility Operations (LVO): When prevailing horizontal visibility drops below 800 meters or Runway Visual Range (RVR) falls below 550 meters, Category-II/III Instrument Landing Systems (ILS) are initiated. Non-CAT-III compliant aircraft face immediate diversion. Commuters traveling to airports must anticipate road delays of 45-60 minutes."
    },
    {
        "id": "CWC_RIVER_012",
        "category": "HYDROLOGY_CWC",
        "title": "Central Water Commission River Inundation & Dam Gate Rules",
        "source": "CWC Basin Flood Forecasting Bulletin",
        "tags": ["cwc", "river", "musi", "godavari", "krishna", "ganga", "dam", "barrage", "flood", "discharge"],
        "content": "River Basin Telemetry: Warning Level is reached when water surface level approaches within 1.0 meter of the high flood level (HFL). When upstream catchment rainfall exceeds 70 mm in 12 hours, dam gate discharge alerts are broadcast via district sirens. Low-lying riverbank settlements within 500 meters of the active floodplain must initiate precautionary evacuations."
    },
    {
        "id": "ICAR_RABI_013",
        "category": "AGROMET_ICAR",
        "title": "ICAR Winter Frost & Cold Wave Crop Protection Strategies",
        "source": "ICAR-IARI Rabi Crop Management Handbook",
        "tags": ["frost", "cold wave", "mustard", "potato", "winter", "north india", "rajasthan", "punjab", "temperature"],
        "content": "Frost Protection: When minimum winter temperatures dip below 4°C with calm winds and clear skies, ground frost risk rises sharply, damaging flowering mustard, potato, and vegetable crops. Apply light evening sprinkler irrigation or create evening biomass smoke mulch (smudge fire) along the western windward boundary to elevate canopy temperatures by 1.5°C to 2.0°C."
    }
]

