# 🌦️ AakashaVani (WeatherGPT) — National Weather & Disaster Intelligence Platform

> **Empathetic, Multi-Model, Edge-First Conversational Meteorological Platform tailored for India's 1.4B Citizens, Farmers, and Disaster Responders.**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ollama](https://img.shields.io/badge/Ollama_Edge_AI-000000?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet_GIS-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

---

## 📌 Overview

**AakashaVani (WeatherGPT)** is a next-generation meteorological and emergency intelligence platform built to bridge the gap between complex numerical weather predictions and ground-level action for rural farmers, urban commuters, and disaster emergency managers across India.

Unlike conventional weather apps that display raw numbers or generic forecasts, AakashaVani combines:
1. **Sovereign On-Device Edge SLM (`Suraksha360`)**: Fine-tuned Small Language Model running locally via Ollama with 100% GPU acceleration and offline resilience.
2. **Dynamic Multi-Model Router**: Capability-based intelligent dispatch across local Edge SLMs (`Suraksha360` / `Qwen3-8B`) and ultra-low-latency cloud specialists (`Groq / gpt-oss-120b`).
3. **Physical NWP & Doppler Grounding**: High-resolution ECMWF & GFS blend via Open-Meteo, RainViewer Doppler radar composites, and WMO WIS 2.0 MQTT telemetry.
4. **Hyper-Local Agromet Advisories**: ICAR-CRIDA rule engine delivering localized crop spraying windows, pest management, and heat stress alerts.
5. **NDMA CAP Common Alerting Protocol**: Interactive WebGIS hazard geofences, evacuation shelters, river gauge metrics, and emergency broadcasts.
6. **12+ Indian Regional Languages & Voice Interaction**: Full bidirectional speech typing (STT) and voice readout (TTS) supporting Telugu, Hindi, Marathi, Bengali, Tamil, Kannada, Hinglish, Telish, and English.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────┐
                                  │      AakashaVani Frontend       │
                                  │  (React 18 + Vite + Tailwind)   │
                                  │  • Desktop WebGIS Cockpit       │
                                  │  • Mobile Native PWA Frame      │
                                  └───────────────┬─────────────────┘
                                                  │
                                                  ▼
                                  ┌─────────────────────────────────┐
                                  │     FastAPI Backend Router      │
                                  │      (Python 3.11 / ASGI)       │
                                  └───────────────┬─────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                ▼
  ┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
  │   Live Meteorological Data  │  │  Model Router & Supervisor  │  │   Disaster & Agromet Engine │
  │ • Open-Meteo Physical NWP   │  │ • Local Sovereign SLM       │  │ • ICAR-CRIDA Crop Rules     │
  │ • RainViewer Doppler Radar  │  │   (`Suraksha360` on Ollama) │  │ • NDMA CAP Disaster Polygons│
  │ • CWC River Gauge Telemetry │  │ • Cloud Specialist (Groq)   │  │ • Emergency Situation Room  │
  │ • WMO WIS 2.0 MQTT Stream   │  │ • Deterministic Fallback    │  │ • Evacuation Routing Mesh   │
  └─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 📱 Dual Experience: WebGIS Cockpit & Mobile PWA
- **Desktop Cockpit**: Full tactical mission control featuring split-pane WebGIS map, interactive Doppler radar overlays, real-time river gauges, and active disaster timelines.
- **Mobile First Experience**: Compact, touch-optimized mobile app with dedicated bottom navigation (`Home`, `Chat`, `Map`, `Desk`, `Alerts`), 1-on-1 voice mode, and inline formatted weather cards.

### 2. 🤖 Multi-Model Edge Intelligence Ecosystem
- **Suraksha360 Local SLM**: Dedicated on-device fine-tuned QLoRA adapter running on local NVIDIA hardware (RTX 5050 / VRAM optimized), preserving privacy and zero cloud dependence.
- **Groq Cloud Specialist**: Sub-second (100ms) execution for multi-variable convective storm forecasts and instant responses.
- **Graceful Fallback Matrix**: If local Ollama or cloud connections drop, the system automatically falls back without crashing, maintaining uninterrupted user availability.

### 3. 🌾 ICAR-CRIDA Agromet Advisory Service
- Real-time crop-specific spraying windows (e.g. Cotton, Paddy, Chilli, Maize).
- Automated rain wash-off warnings: prevents chemical wastage by analyzing upcoming 24-hour precipitation probabilities.

### 4. 🚨 Common Alerting Protocol (CAP) & Situation Room
- Verified disaster hazard boundaries (Cyclones, Flash Floods, Severe Thunderstorms).
- Clear demarcation between **Live Physical Telemetry** and **Benchmark Simulation Scenarios** to guarantee ethical, safe operations.

### 5. 🎙️ Hands-Free Regional Voice Interface
- Integrated Speech Recognition (STT) for dialect-aware voice queries.
- High-clarity native regional Speech Synthesis (TTS) for non-literate rural farmers.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet |
| **Backend** | FastAPI, Uvicorn, Python 3.11, Pydantic v2, HTTPX |
| **AI / SLM** | Ollama (`suraksha360`, `qwen3:8b`), Groq API (`openai/gpt-oss-120b`), LoRA / QLoRA |
| **Data & GIS** | Open-Meteo Physical NWP, RainViewer Global Doppler Radar, Leaflet WebGIS |
| **Database & Cache** | SQLite / Neon PostgreSQL, In-Memory & Redis hybrid caching |
| **Deployment** | Vercel (Frontend), Render (Backend API), Cloudflare Tunnels (Edge-to-Cloud) |

---

## 🛠️ Local Development Quickstart

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Ollama (Optional, for local sovereign AI)

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/balasesha1234-ux/aakashavani-weathergpt-.git
cd aakashavani-weathergpt-/backend

# Install Python dependencies
pip install -r requirements.txt

# Run backend development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Web app will be live at `http://localhost:5173`.

### 3. Local Sovereign AI (Optional)
```bash
# Pull base model
ollama pull qwen3:8b

# Build Suraksha360 sovereign agent
cd backend
ollama create suraksha360 -f Modelfile.suraksha360
```

---

## 👥 Contributors & Acknowledgments
- **Project APEX / AakashaVani Team**
- Grateful acknowledgment to **IMD (India Meteorological Department)**, **ICAR-CRIDA**, and **Open-Meteo** for physical meteorological and agricultural models.

---
*Built with ❤️ for Indian Climate & Disaster Resilience.*
