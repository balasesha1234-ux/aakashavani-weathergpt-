# 🌦️ AakashaVani (WeatherGPT)
**Conversational AI Platform for Real-Time Weather Forecasting, Adaptive Disaster Emergency Mode & Climate Intelligence**

> **Problem Statement ID:** 26068  
> **Organization:** Ministry of Earth Sciences (MoES) | India Meteorological Department (IMD)  
> **Theme:** Disaster Management & Rural Accessibility

---

## 🌟 Key Features & Capabilities

1. **🧠 Grounded Multi-Agent AI Core:**
   - Zero-hallucination meteorological tool calling.
   - Grounded explanations citing IMD AWS station telemetry, NOAA GFS 0.25° NWP models, and ICAR Agromet bulletins.
   - Multilingual voice support across **Hindi, Telugu, Tamil, Marathi, Bengali, and English**.

2. **🚨 Adaptive Emergency Mode (Disaster Management):**
   - Automatically morphs from normal weather UI to a safety-first **Emergency Status Panel** when verified IMD Red/Orange alerts intersect the user's location.
   - **"What's Changed?" Situational Delta Log:** Real-time chronological tracking of shifting storm tracks and rain accumulation.
   - **Verified Emergency Resources Locator:** Maps nearby hospitals, police, fire stations, and relief shelters with distance (km), phone numbers, and operational status.
   - **Grounded NDMA Do's & Don'ts:** Multilingual life-safety protocols with voice speech readout.

3. **🗺️ Interactive WebGIS Weather Studio:**
   - Leaflet map with Doppler Weather Radar rain reflectivity layers.
   - Live Cyclone trajectory path and cone of uncertainty.
   - IMD color-coded alert boundary polygons (Red / Orange / Yellow).

4. **🌾 Agromet Crop Advisory Matrix:**
   - Tailored advice for Cotton (Kapas), Rice (Dhan), Soybean, Wheat, and Sugarcane.
   - Rainfall threshold rules for pesticide/fertilizer spraying windows and drainage.

5. **📶 Low-Bandwidth / 2G Offline Fallback:**
   - 160-character plain text 2G SMS query responder.
   - Automated IVR voice telephony loop simulator for rural accessibility.

6. **📊 Full 15-Table Relational & Spatial Database:**
   - Schema covering `USER`, `DEVICE`, `LOCATION`, `WEATHER_OBSERVATION`, `FORECAST`, `WARNING`, `WARNING_AREA`, `EMERGENCY_RESOURCE`, `SUBSCRIPTION`, `CONVERSATION`, `MESSAGE`, `RESPONSE_TRACE`, `DATA_SOURCE`, `MAP_SNAPSHOT`, `FEEDBACK`.

---

## 🚀 Quick Start & Launch Instructions

### Method 1: One-Click Launch (Windows)
Double-click `start_all.bat` in the project root. It will automatically start both the backend API and frontend UI.

### Method 2: Manual Start

#### 1. Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **API Documentation & Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Root API Status:** [http://localhost:8000/](http://localhost:8000/)

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
* **Web UI Dashboard:** [http://localhost:5173](http://localhost:5173)

---

## 🎭 1-Click Presentation Demo Scenarios for Judges

Use the **"Judges / Demo Scenarios"** strip at the top of the interface:

1. **🌾 Rural Cotton Farmer (Wardha, Maharashtra)**:
   - Query in Hindi: *"भैया, क्या कल कपास में खाद डाल सकते हैं?"*
   - Highlights: Regional Hindi voice, Agromet fertilizer rule, 24h meteogram chart, IMD AAS citation.
2. **🚨 Cyclone Red Alert (Puri, Odisha)**:
   - Activates **Adaptive Emergency Mode**.
   - Highlights: Red alert morph, nearby cyclone relief shelter pins, "What's Changed?" delta log, NDMA protocols.
3. **⛵ Coastal Fisherman (Visakhapatnam, AP)**:
   - Query in Telugu: *"రేపు సముద్రంలో చేపల వేటకు వెళ్లడం సురక్షితమేనా?"*
   - Highlights: Telugu voice advisory, wave swell height, wind speed in knots, squall warning badge.
4. **📶 2G Offline SMS Simulator**:
   - Click `2G SMS` on the bottom bar to test plain text responses for feature phones.
5. **☎️ Automated IVR Voice Simulator**:
   - Click `IVR` on the bottom bar to test the telephone voice hotline script.

---

## 🧪 Running Automated Tests
```bash
cd backend
python -m pytest tests/
```
