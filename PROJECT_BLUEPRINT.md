# 🌦️ AakashaVani (WeatherGPT) — Complete Architecture & Diagram Master

Every diagram below is updated with:
1. **Adaptive Emergency Mode** (Automatic trigger on High/Critical IMD Red/Orange alerts)
2. **Verified Emergency Resources Locator** (Hospitals, Police, Fire, Shelters, Helplines with strict verification guardrails)
3. **"What's Changed?" Situational Delta Engine**
4. **Low-Bandwidth / 2G Offline SMS & IVR Telephony Fallback**
5. **Full 15-Table Relational & Geospatial Schema (`WARNING_AREA`, `EMERGENCY_RESOURCE`, `MAP_SNAPSHOT`)**

---

## 📊 Diagram 1: End-to-End User & Emergency Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User / Farmer
    participant App as 📱 Mobile / Web App
    participant GPS as 🛰️ GPS & Geocoder
    participant GW as 🚪 API Gateway
    participant Query as 🧠 Query & NLU Service
    participant Orch as 🌦️ Weather Orchestrator
    participant Alert as 🚨 Alert & Emergency Engine
    participant ResDB as 🏥 Verified Resource Registry
    participant LLM as 🤖 Grounded LLM
    participant Notif as 📢 Notification Gateway (Push/SMS/IVR)

    User->>App: Open app / Send query
    App->>GPS: Capture GPS coordinates
    GPS-->>App: Lat, Lon, Accuracy
    App->>GW: Ingest query + GPS location + Language

    GW->>Alert: Check active hazard geofences for location
    
    alt High / Critical Warning Active (Red/Orange Alert)
        Alert->>Alert: Evaluate hazard severity & expanding geofence
        Alert->>ResDB: Query verified nearby hospitals, shelters & police
        ResDB-->>Alert: Verified facilities with distance & contacts
        Alert->>LLM: Pass hazard facts, NDMA safety rules & resources
        LLM->>LLM: Generate Grounded Emergency Action Plan in regional language
        LLM-->>App: Activate Adaptive Emergency Mode (Red UI + Map + Delta Log + Audio)
        Alert->>Notif: Trigger Emergency Push, 2G SMS & Automated IVR Voice Call
        Notif-->>User: Emergency Phone Call / High-Priority SMS
    else Normal / Low Severity Weather (Green/Yellow)
        GW->>Query: Classify intent (Crop advisory / 7-Day Forecast)
        Query->>Orch: Fetch AWS observation + GFS/WRF grid + Agro rules
        Orch-->>LLM: Verified weather numbers & crop matrix
        LLM->>LLM: Compose grounded advice & source badges
        LLM-->>App: Return Normal Weather Card + Meteogram + Audio
        App->>User: Display Forecast & Speak advice
    end
```

---

## ⚙️ Diagram 2: Extended Technical Execution Lifecycle (All Systems)

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Farmer / Agency
    participant App as Mobile App / PWA
    participant GPS as GPS & Location Service
    participant GW as API Gateway
    participant Auth as Identity & Consent
    participant NLU as Query Understanding Engine
    participant Ctx as User Context & Preferences
    participant Orch as Weather Data Orchestrator
    participant IMD as IMD Live APIs & Radar
    participant NWP as GFS / WRF Models
    participant Alert as Alert & Emergency Engine
    participant Res as Verified Resource Registry
    participant LLM as LLM Response Service
    participant Notif as Notification Gateway (Push/SMS/IVR)
    participant DB as PostgreSQL / PostGIS / Redis

    User->>App: Launch WeatherGPT
    App->>GW: Authenticate session
    GW->>Auth: Validate permissions & consent

    alt Location permission granted
        App->>GPS: Request device location
        GPS-->>App: Coordinates, geohash & accuracy
        App->>GW: Reverse geocode to village, district, state
    else Permission denied
        App->>User: Show manual district search
    end

    User->>App: Ask question (Text / Voice / SMS / IVR)

    App->>GW: Forward query, location, language & device context
    GW->>NLU: Classify intent & extract entities (crop, time, hazard)
    NLU->>Ctx: Load user role, saved crops & notification preferences

    par Parallel Data Ingestion
        Orch->>IMD: Fetch live AWS station readings & radar tiles
        Orch->>NWP: Fetch GFS 0.25° / WRF forecast grids
        Orch->>Alert: Fetch active IMD CAP warnings & geofence polygons
    end

    Orch->>DB: Cache normalized metrics & source timestamps
    
    Alert->>Alert: Check intersection between user location & warning geofences
    
    alt User in High/Critical Disaster Zone
        Alert->>Res: Geospatial lookup for nearby shelters, hospitals & police
        Res-->>Alert: Return verified resources (filtered by operational status)
        Alert->>LLM: Verified emergency payload (hazard, delta shifts, safety rules)
        LLM->>LLM: Ground emergency guidance + cite authoritative sources
        LLM->>GW: Emergency status payload + map snapshot + voice stream
        GW->>App: Render Adaptive Emergency Mode UI
        Alert->>Notif: Dispatch Emergency Push, 2G SMS & IVR phone broadcast
        Notif->>User: Receive urgent multi-channel warning
    else User in Normal / Low Severity Zone
        Orch->>LLM: Verified forecast metrics + agronomy decision rules
        LLM->>LLM: Compose grounded advice with confidence score
        LLM->>GW: Weather card + hourly meteogram + source badges
        GW->>App: Render Normal Weather Dashboard
        App->>User: Display cards & play regional TTS voice
    end

    opt User Submits Feedback
        User->>App: Submit rating (1-5 stars) & comments
        App->>DB: Record feedback linked to response trace ID
    end
```

---

## 🏛️ Diagram 3: High-Level System Architecture & Services (5 Tiers)

```mermaid
flowchart LR
    subgraph External ["1. External Systems"]
        E1["IMD AWS & ARG APIs"]
        E2["NOAA GFS & IMD WRF"]
        E3["Doppler Radar & INSAT-3D"]
        E4["NDMA CAP Disaster Feeds"]
        E5["Verified Resource Registries"]
        E6["Multi-Channel Gateways<br/>(FCM, Twilio, Exotel)"]
    end

    subgraph DataSvc ["2. Data & Streaming Services"]
        D1["MQTT / WIS 2.0 Stream"]
        D2["Validation, Normalization & ETL"]
        D3[("Redis Cache<br/>(Sub-second State)")]
        D4[("PostgreSQL + PostGIS<br/>(Spatial & Relational DB)")]
        D5[("Time-Series DB<br/>(Station History)")]
        D6[("Vector Store / pgvector<br/>(Agromet RAG)")]
    end

    subgraph AISvc ["3. AI & Domain Intelligence Services"]
        A1["Indic STT (Speech-to-Text)"]
        A2["NLU Intent & Entity Extractor"]
        A3["Deterministic Weather Tool Caller"]
        A4["Agronomy & Disaster Rule Engine"]
        A5["Grounded LLM Response Service"]
        A6["Indic TTS (Voice Synthesis)"]
        A7["Traceability & Provenance Auditor"]
    end

    subgraph AppSvc ["4. Application & Emergency Services"]
        S0["API Gateway & Auth"]
        S1["User & Role Preference Service"]
        S2["Query & Session Service"]
        S3["Forecast & Meteogram Service"]
        S4["Adaptive Emergency Mode Manager"]
        S5["Emergency Resource Geospatial Locator"]
        S6["What's Changed? Delta Tracker"]
        S7["Geofenced Alert Subscription Service"]
    end

    subgraph Clients ["5. Multi-Modal Client Applications"]
        C1["📱 Mobile PWA (Offline Cached)"]
        C2["🖥️ Web GIS Mapping Studio"]
        C3["🚨 High-Contrast Emergency Panel"]
        C4["☎️ Automated IVR Voice Hotline"]
        C5["💬 2G SMS & WhatsApp Bot"]
    end

    %% Ingestion Links
    E1 & E2 & E3 & E4 & E5 --> D1
    D1 --> D2 --> D3 & D4 & D5 & D6

    %% Gateway and App Services
    S0 --> S1 & S2 & S3 & S4 & S5 & S6 & S7
    S2 --> A2 --> A3 --> D3 & D4 & D6
    A3 --> A4 --> A5 --> A6
    A5 --> A7 --> D4

    %% Emergency Service Links
    S4 --> S5 & S6
    S5 --> D4
    S7 --> E6 --> C1 & C4 & C5

    %% Client Connections
    C1 & C2 & C3 & C4 & C5 --> S0
    A6 --> C1 & C2 & C3 & C4
```

---

## 🌊 Diagram 4: Detailed Component & Data Flow Architecture

```mermaid
flowchart TD
    subgraph Sources ["1. Trusted Authoritative Sources"]
        S_IMD["IMD Observations & AWS Stations"]
        S_NWP["GFS 0.25° & IMD WRF Forecast Grids"]
        S_SAT["Satellite & Doppler Radar Composite"]
        S_CAP["Official Warning Feeds (NDMA CAP XML)"]
        S_RES["Verified Emergency Resource Registry"]
        S_HIST["50-Year Historical Climate Normals"]
    end

    subgraph Ingestion ["2. Streaming Ingestion & Validation"]
        B_INGEST["Streaming Ingestion: MQTT / WIS 2.0 / WebSockets"]
        B_VAL["Validation, Normalization & Unit Conversion"]
        B_CACHE[("Redis Cache & Latest Conditions")]
    end

    subgraph CoreEngine ["3. WeatherGPT Core Engine"]
        B_ORCH["Weather Data Orchestrator"]
        B_ALERT["Alert & Early Warning Engine"]
        B_RULES["Agronomy & Life-Safety Rule Engine"]
        B_RAG["Grounded Knowledge & Source Retrieval"]
        B_EMER["Adaptive Emergency Mode Controller"]
        B_DELTA["What's Changed? Delta Engine"]
        B_GEN["Response Generation & Indic Translation"]
        B_AUDIT["Audit, Provenance & Observability Trace"]
    end

    subgraph Storage ["4. Storage & Operations"]
        ST_PG[("PostgreSQL + PostGIS<br/>(Users, Geofences, Alerts, Resources)")]
        ST_RAST[("Object Storage for Raster Data")]
        ST_TS[("Time-Series Store")]
        ST_LOGS[("Metrics, Traces & Feedback DB")]
    end

    subgraph Ingress ["5. Ingress & Multi-Modal Delivery"]
        U_DEV["User (Mobile / Web / Voice / SMS / IVR)"]
        U_GPS["GPS Location Capture & Geohash"]
        U_GEO["Reverse Geocoding & Geofencing"]
        U_GW["API Gateway & Session Manager"]
        U_NLU["NLU & LLM Query Planner"]
        U_NOTIF["Push, SMS, WhatsApp & IVR Notification Gateway"]
    end

    %% Ingestion Pipeline
    Sources --> B_INGEST --> B_VAL --> B_CACHE --> B_ORCH

    %% User Ingress Pipeline
    U_DEV --> U_GPS --> U_GEO --> U_GW --> U_NLU --> B_ORCH

    %% Processing & Decision Core
    B_ORCH --> B_ALERT & B_RULES & B_RAG
    B_ALERT --> B_EMER & B_DELTA
    B_EMER --> B_GEN
    B_RULES --> B_GEN
    B_RAG --> B_GEN
    B_GEN --> B_AUDIT --> U_GW --> U_DEV
    B_EMER --> U_NOTIF --> U_DEV

    %% Storage Links
    B_ORCH --> ST_PG & ST_RAST & ST_TS
    B_AUDIT --> ST_LOGS
```

---

## 🗄️ Diagram 5: Complete Database Entity-Relationship Diagram (15 Tables)

```mermaid
erDiagram
    USER ||--o{ DEVICE : "uses"
    USER ||--o{ LOCATION : "owns"
    USER ||--o{ SUBSCRIPTION : "creates"
    USER ||--o{ CONVERSATION : "starts"
    USER ||--o{ FEEDBACK : "submits"

    LOCATION ||--o{ WEATHER_OBSERVATION : "has"
    LOCATION ||--o{ FORECAST : "receives"
    LOCATION ||--o{ WARNING : "covers"
    LOCATION ||--o{ SUBSCRIPTION : "monitored_by"

    WARNING ||--|{ WARNING_AREA : "defines"
    WARNING_AREA ||--o{ EMERGENCY_RESOURCE : "includes_or_nears"

    CONVERSATION ||--|{ MESSAGE : "contains"
    MESSAGE ||--|| RESPONSE_TRACE : "produces"
    RESPONSE_TRACE ||--|{ DATA_SOURCE : "cites"
    RESPONSE_TRACE ||--o{ MAP_SNAPSHOT : "renders"
    MESSAGE ||--o{ FEEDBACK : "rated_by"

    USER {
        uuid user_id PK
        string role
        string preferred_language
        boolean voice_enabled
        boolean low_bandwidth_mode
        datetime created_at
    }

    DEVICE {
        uuid device_id PK
        uuid user_id FK
        string platform
        string push_token
        boolean gps_permission
        datetime last_seen
    }

    LOCATION {
        uuid location_id PK
        uuid user_id FK
        decimal latitude
        decimal longitude
        decimal accuracy_meters
        string village
        string district
        string state
        string geohash
        boolean current_location
        datetime captured_at
    }

    WEATHER_OBSERVATION {
        uuid observation_id PK
        uuid location_id FK
        string provider
        decimal temperature
        decimal rainfall
        decimal humidity
        decimal wind_speed
        datetime observed_at
    }

    FORECAST {
        uuid forecast_id PK
        uuid location_id FK
        string provider
        string model
        datetime valid_from
        datetime valid_to
        json forecast_payload
        decimal confidence
        datetime issued_at
    }

    WARNING {
        uuid warning_id PK
        uuid location_id FK
        string hazard_type
        string severity
        string instructions
        string provider
        datetime issued_at
        datetime expires_at
    }

    WARNING_AREA {
        uuid warning_area_id PK
        uuid warning_id FK
        string geofence
        string affected_districts
        decimal area_size
        datetime valid_from
        datetime valid_to
    }

    EMERGENCY_RESOURCE {
        uuid resource_id PK
        string name
        string resource_type
        decimal latitude
        decimal longitude
        string address
        string contact
        string source
        datetime verified_at
        string status
    }

    SUBSCRIPTION {
        uuid subscription_id PK
        uuid user_id FK
        uuid location_id FK
        string hazard_type
        string channel
        string minimum_severity
        boolean active
    }

    CONVERSATION {
        uuid conversation_id PK
        uuid user_id FK
        string language
        string channel
        datetime started_at
    }

    MESSAGE {
        uuid message_id PK
        uuid conversation_id FK
        string sender
        text content
        string intent
        datetime created_at
    }

    RESPONSE_TRACE {
        uuid trace_id PK
        uuid message_id FK
        decimal confidence
        integer latency_ms
        string safety_status
        datetime generated_at
    }

    DATA_SOURCE {
        uuid source_id PK
        uuid trace_id FK
        string source_type
        string provider
        string dataset
        string source_timestamp
        string fact_covered
    }

    MAP_SNAPSHOT {
        uuid map_id PK
        uuid trace_id FK
        string layer_type
        string tile_reference
        string track_reference
        string affected_geofence
        datetime generated_at
    }

    FEEDBACK {
        uuid feedback_id PK
        uuid user_id FK
        uuid message_id FK
        integer rating
        string category
        text comment
        datetime created_at
    }
```

---

## 🚨 Diagram 6: Adaptive Emergency Mode State Machine

```mermaid
stateDiagram-v2
    [*] --> NormalWeatherMode: App Launch / Location Selected
    
    state NormalWeatherMode {
        [*] --> StandardDashboard: Home, 7-Day Forecast, Chat
        StandardDashboard --> BannerDisplay: Low/Normal Warning Detected (Green/Yellow)
    }

    NormalWeatherMode --> AdaptiveEmergencyMode: Verified High/Critical Warning (IMD Orange/Red Alert) Intersects User Location
    
    state AdaptiveEmergencyMode {
        [*] --> EmergencyStatusPanel: Prominent Red Alert UI
        EmergencyStatusPanel --> WhatsChangedLog: Continuous Monitoring & Update Deltas
        EmergencyStatusPanel --> EmergencyGISMap: User Pin, Hazard Polygons, Radar/Cyclone Cones
        EmergencyStatusPanel --> VerifiedResources: Nearby Shelters, Hospitals, Police, Fire Stations
        EmergencyStatusPanel --> GroundedSafetyActions: NDMA Do's & Don'ts + Multilingual Voice
        EmergencyStatusPanel --> MultimodalDispatch: Push, 2G SMS, Automated IVR Phone Calls
    }

    AdaptiveEmergencyMode --> NormalWeatherMode: Official Warning Downgraded or Expired
```

---

## 🏥 Diagram 7: Emergency Resource Geospatial Workflow

```mermaid
flowchart TD
    W["🚨 Official IMD / NDMA WARNING"] --> WA["📍 WARNING_AREA / Affected Geofence"]
    U["👤 USER"] --> L["📌 USER LOCATION (GPS / Geohash)"]
    
    WA & L --> MATCH{"🗺️ Geospatial Geofence Matching<br/>(Is User Inside Warning Area?)"}
    
    MATCH -- NO --> NORM["☀️ Continue Normal Weather Experience"]
    MATCH -- "YES: Low/Normal" --> BANNER["⚠️ Display Standard Warning Banner"]
    MATCH -- "YES: High/Critical" --> EMER["🚨 ACTIVATE ADAPTIVE EMERGENCY MODE"]
    
    EMER --> RES["🏥 Query Nearby EMERGENCY_RESOURCE<br/>(Hospitals, Police, Fire, Shelters)"]
    
    RES --> VERIF{"🔍 Check Source, verified_at<br/>& Operational Status"}
    
    VERIF -- "Operational Status = VERIFIED" --> LIVE["✅ Display Resource with Contact, Distance & Live Status"]
    VERIF -- "Operational Status = UNCONFIRMED" --> LISTED["ℹ️ Display as Officially Listed Resource Only<br/>(Strict Guardrail: Do NOT imply active rescue-team availability)"]
    
    LIVE & LISTED --> PANEL["📱 Render Emergency Assistance Panel & Multimodal Audio"]
```
