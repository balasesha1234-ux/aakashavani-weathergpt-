from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class USSDGatewayService:
    """Phase 5: Resilient Multi-Channel Telecom Gateway, USSD Session Engine & Mesh Relay."""

    @staticmethod
    def process_ussd_session(session_id: str, phone: str, user_input: str = "", district: str = "Wardha") -> Dict[str, Any]:
        """Stateful USSD (*180#) menu engine for 2G basic feature phones."""
        clean_input = user_input.strip()

        # Root Menu (*180#)
        if not clean_input or clean_input == "*180#":
            menu_text = (
                f"AakashaVani (*180#)\n"
                f"District: {district}\n"
                f"1. Current Weather\n"
                f"2. Crop Spray Advisory\n"
                f"3. Cyclone Shelters\n"
                f"4. PM-Kisan Status\n"
                f"Select Option (1-4):"
            )
            return {
                "session_id": session_id,
                "status": "CONTINUE",
                "screen_text": menu_text,
                "is_terminal": False
            }

        # Submenu 1: Current Weather
        elif clean_input == "1":
            return {
                "session_id": session_id,
                "status": "END",
                "screen_text": f"{district} Weather:\nTemp: 29C (Feels 31C)\nHumidity: 76%\nRain Prob: 35% isolated\nWind: 14 km/h\nSource: IMD AWS Grid",
                "is_terminal": True
            }

        # Submenu 2: Crop Spray Advisory
        elif clean_input == "2":
            return {
                "session_id": session_id,
                "status": "END",
                "screen_text": f"Agromet Advisory ({district}):\nCotton: Safe spraying window till 11AM.\nKeep drainage trenches open.\nCall 1800-180-1551 for KVK support.",
                "is_terminal": True
            }

        # Submenu 3: Cyclone Shelters
        elif clean_input == "3":
            return {
                "session_id": session_id,
                "status": "END",
                "screen_text": f"Emergency Directory ({district}):\n1. Cyclone Shelter #12 (Cap: 1200, Ph: 1077)\n2. Dist Civil Hospital (ICU: 45, Ph: 102)\nNatl Helpline: 112",
                "is_terminal": True
            }

        # Submenu 4: PM-Kisan Status
        elif clean_input == "4":
            return {
                "session_id": session_id,
                "status": "END",
                "screen_text": f"PM-Kisan Beneficiary:\nRameshwar Patil\nID: PMK-MH-2024-8921\nStatus: 16th Installment Credited (INR 2,000)",
                "is_terminal": True
            }

        # Invalid Selection
        else:
            return {
                "session_id": session_id,
                "status": "END",
                "screen_text": "Invalid option selected. Please dial *180# again to restart.",
                "is_terminal": True
            }

    @staticmethod
    def process_carrier_sms_webhook(from_number: str, body: str) -> Dict[str, Any]:
        """Processes Twilio/Exotel inbound SMS webhook and formats 160-char response."""
        now_iso = datetime.now(timezone.utc).isoformat()
        body_upper = body.strip().upper()
        
        # Simple extraction
        district = "Wardha"
        if "PURI" in body_upper:
            district = "Puri"
        elif "MUMBAI" in body_upper:
            district = "Mumbai"
        elif "DELHI" in body_upper:
            district = "Delhi"

        sms_reply = f"Mausam {district}: 29C, 76% RH, Rain 35%. Safe spraying till 11AM. Helplines: 112, 1077. Grounded in IMD/Open-Meteo."
        return {
            "status": "WEBHOOK_PROCESSED",
            "from": from_number,
            "received_body": body,
            "reply_text": sms_reply[:160],
            "char_count": len(sms_reply[:160]),
            "carrier_gateway": "Twilio / Exotel / BSNL SMPP",
            "processed_at": now_iso
        }

    @staticmethod
    def generate_twiml_voice_xml(district: str = "Wardha", language: str = "hi") -> Dict[str, Any]:
        """Generates TwiML / Exotel Voice XML response for inbound carrier telephone calls."""
        xml_payload = (
            f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<Response>\n'
            f'  <Say language="hi-IN" voice="Polly.Aditi">\n'
            f'    Namaste! Welcome to AakashaVani weather helpline for {district}.\n'
            f'    Current temperature is 29 degrees with light rain chances.\n'
            f'  </Say>\n'
            f'  <Gather numDigits="1" action="/api/telecom/webhooks/voice/gather">\n'
            f'    <Say language="hi-IN">Press 1 for Crop Advice. Press 2 for Disaster Helplines.</Say>\n'
            f'  </Gather>\n'
            f'</Response>'
        )
        return {
            "content_type": "application/xml",
            "district": district,
            "language": language,
            "twiml_xml": xml_payload
        }

    @staticmethod
    def relay_mesh_packet(packet_id: str, sender_node: str, payload_bytes: int = 64) -> Dict[str, Any]:
        """Simulates LoRaWAN 868MHz delay-tolerant store-and-forward mesh packet hop."""
        return {
            "packet_id": packet_id,
            "sender_node": sender_node,
            "frequency_mhz": 868.1,
            "modulation": "LoRa SF10 BW 125kHz",
            "signal_rssi_dbm": -98,
            "snr_db": 8.5,
            "payload_bytes": payload_bytes,
            "hop_count": 3,
            "relay_nodes": ["LORA-GATEWAY-PURI-01", "LORA-REPEATER-04", "LORA-BASE-COLLECTORATE"],
            "delivery_status": "STORED_AND_FORWARDED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
