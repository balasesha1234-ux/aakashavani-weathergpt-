from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json

class TelecomService:
    """Phase 2: National Telecom & Vernacular Push Broadcast Engine."""

    @staticmethod
    def process_missed_call(phone: str, district: str, language: str = "hi") -> Dict[str, Any]:
        """Simulates 1800-WEATHER missed-call instant voice callback generator."""
        now_iso = datetime.now(timezone.utc).isoformat()
        
        spoken_scripts = {
            "hi": f"नमस्ते किसान भाई! 1800-WEATHER में आपका स्वागत है। {district} के लिए आज का मौसम: हल्की बारिश और तापमान 29 डिग्री है। कपास में कीटनाशक छिड़काव के लिए मौसम अनुकूल है।",
            "te": f"నమస్కారం! 1800-WEATHER హెల్ప్‌లైన్‌కు స్వాగతం. {district} లో నేడు వాతావరణం: తేలికపాటి వర్షం, ఉష్ణోగ్రత 29 డిగ్రీలు. పంటల రక్షణ కోసం సలహాలు సిద్ధంగా ఉన్నాయి.",
            "mr": f"नमस्कार! 1800-WEATHER मध्ये आपले स्वागत आहे. {district} मध्ये आजचे हवामान: हलका पाऊस आणि तापमान 29 अंश सेल्सिअस राहील. फवारणीसाठी हवामान अनुकूल आहे.",
            "en": f"Welcome to 1800-WEATHER Helpline. Weather report for {district}: Partly cloudy with light rain chances. Temperature is 29°C."
        }

        return {
            "status": "CALLBACK_DISPATCHED",
            "caller_phone": phone,
            "district": district,
            "language": language,
            "callback_latency_seconds": 3,
            "dispatched_at": now_iso,
            "audio_script": spoken_scripts.get(language, spoken_scripts["en"]),
            "audio_url": f"https://cdn.aakashavani.gov.in/voice/daily_{district.lower()}_{language}.mp3",
            "telecom_carrier": "BSNL / Jio Kisaan Grid",
            "cost_to_farmer": "INR 0.00 (Toll-Free Missed Call)"
        }

    @staticmethod
    def generate_whatsapp_broadcast(district: str, crop: str = "Cotton", language: str = "hi") -> Dict[str, Any]:
        """Generates localized WhatsApp enterprise card with voice note and interactive quick-reply buttons."""
        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
        
        message_templates = {
            "hi": f"🌾 *आकाशवाणी कृषि मौसम बुलेटिन* 🌦️\n📍 *जिला:* {district} | 📅 *दिनांक:* {now_str} IST\n\n🌱 *फसल:* {crop} (फूल आने की अवस्था)\n🌡️ *तापमान:* 29°C | 💧 *नमी:* 78%\n🌧️ *वर्षा संभावना:* अगले 24 घंटे में हल्की बूंदाबांदी (35%)\n\n💡 *विशेष कृषि सलाह:*\n• कीटनाशक छिड़काव सुबह 11 बजे से पहले करें।\n• खेत में जल निकासी की नालियां साफ रखें।\n\n🎙️ _ऊपर दिया गया वॉइस नोट सुनें_",
            "te": f"🌾 *ఆకాశవాణి వ్యవసాయ వాతావరణ బులెటిన్* 🌦️\n📍 *జిల్లా:* {district} | 📅 *తేదీ:* {now_str} IST\n\n🌱 *పంట:* {crop}\n🌡️ *ఉష్ణోగ్రత:* 29°C | 💧 *తేమ:* 78%\n🌧️ *వర్షం:* తేలికపాటి వర్షం కురిసే అవకాశం ఉంది.\n\n💡 *సలహా:* ఎరువుల వాడకం ఉదయం వేళల్లో చేపట్టండి.",
            "en": f"🌾 *AakashaVani Agromet Weather Bulletin* 🌦️\n📍 *District:* {district} | 📅 *Date:* {now_str} IST\n\n🌱 *Crop:* {crop} (Flowering Stage)\n🌡️ *Temp:* 29°C | 💧 *Humidity:* 78%\n🌧️ *Rain Prob:* 35% Isolated Showers\n\n💡 *Actionable Advisory:*\n• Favorable spraying window before 11:00 AM.\n• Ensure drainage channels in cotton fields are clear.\n\n🎙️ _Listen to attached vernacular voice note below._"
        }

        return {
            "status": "READY_FOR_DISPATCH",
            "recipient_group": f"Kisan_Panchayat_{district}",
            "language": language,
            "district": district,
            "card_text": message_templates.get(language, message_templates["en"]),
            "voice_note_url": f"https://cdn.aakashavani.gov.in/voice/agromet_{district.lower()}_{language}.ogg",
            "interactive_buttons": [
                {"id": "btn_spray", "title": "🌱 Spraying Window"},
                {"id": "btn_mandi", "title": "💰 APMC Mandi Rates"},
                {"id": "btn_pmfby", "title": "🛡️ PMFBY Insurance"}
            ]
        }

    @staticmethod
    def calculate_pmfby_crop_risk(crop: str, rainfall_anomaly_pct: float, dry_spell_days: int) -> Dict[str, Any]:
        """Calculates PM-Fasal Bima Yojana (PMFBY) weather index trigger assessment."""
        risk_level = "LOW"
        claim_eligible = False
        payout_factor = 0.0

        if rainfall_anomaly_pct > 50.0:  # Excessive rainfall
            risk_level = "CRITICAL_EXCESS"
            claim_eligible = True
            payout_factor = min(1.0, (rainfall_anomaly_pct - 50.0) / 50.0 * 0.8)
        elif dry_spell_days >= 14:  # Extended dry spell drought
            risk_level = "CRITICAL_DEFICIT"
            claim_eligible = True
            payout_factor = min(1.0, (dry_spell_days - 14) / 10.0 * 0.75)
        elif rainfall_anomaly_pct > 25.0 or dry_spell_days >= 7:
            risk_level = "MODERATE_WATCH"
            claim_eligible = False
            payout_factor = 0.0

        return {
            "crop": crop,
            "rainfall_anomaly_pct": rainfall_anomaly_pct,
            "dry_spell_days": dry_spell_days,
            "pmfby_risk_level": risk_level,
            "automatic_claim_trigger": claim_eligible,
            "estimated_payout_index": round(payout_factor * 100, 1),
            "scheme": "Pradhan Mantri Fasal Bima Yojana (Weather Based Crop Insurance Scheme - WBCIS)",
            "advisory": "Maintain geo-tagged farm photos for expedited PMFBY claim settlement via Kisan Portal."
        }
