from typing import Dict, Any, List

class RulesEngine:
    CROP_RULES = {
        "cotton": {
            "name": "Cotton (कपास)",
            "advisories": {
                "heavy_rain": {
                    "condition": lambda rain: rain >= 20.0,
                    "action": "Immediate stoppage of pesticide (neem oil/chemical) and urea top-dressing. Open 30cm drainage channels to prevent waterlogging and root rot.",
                    "action_hi": "कीटनाशक और खाद का छिड़काव तुरंत रोकें। खेतों में 30 सेमी जल निकासी नालियां खोलें ताकि जलभराव और जड़ सड़न से बचाव हो सके।",
                    "action_hinglish": "Pesticide aur urea top-dressing ka chhidkaw turant rokein. Kheton me 30cm drainage channels kholein taki paani bharne aur root rot se bachav ho sake.",
                    "action_telish": "Pesticides mariyu urea spray ventane aapandi. Polam lo 30cm drainage kaluvalu thavvi neellu nilvakunda chusukondi.",
                    "action_mr": "कीटकनाशक आणि खतांची फवारणी त्वरित थांबवा. शेतातून पाण्याचा निचरा करण्यासाठी चर मोकळे करा."
                },
                "high_humidity": {
                    "condition": lambda hum: hum >= 80,
                    "action": "Inspect crop for pink bollworm and sucking pests (aphids/jassids). Spray 5% neem seed kernel extract if sky clears.",
                    "action_hi": "गुलाबी सुंडी और रस चूसक कीटों के लिए फसल का निरीक्षण करें। मौसम साफ होने पर 5% नीम अर्क का छिड़काव करें।",
                    "action_hinglish": "Pink bollworm aur sucking pests (aphids/jassids) ke liye fasal check karein. Mausam saaf hone par 5% neem extract spray karein.",
                    "action_telish": "Pink bollworm mariyu sucking pests kosam panta pariseelinchandi. Sky clear ayyaka 5% neem extract spray cheyandi.",
                    "action_mr": "गुलाबी बोंडअळी आणि रसशोषक किडींसाठी पिकाची पाहणी करा."
                }
            }
        },
        "rice": {
            "name": "Paddy / Rice (धान)",
            "advisories": {
                "heavy_rain": {
                    "condition": lambda rain: rain >= 35.0,
                    "action": "Maintain 5-7cm standing water in transplanted fields; drain excess water beyond 10cm to prevent stem rot.",
                    "action_hi": "रोपाई वाले खेतों में 5-7 सेमी पानी बनाए रखें; तना सड़न से बचने के लिए 10 सेमी से अधिक पानी निकाल दें।",
                    "action_hinglish": "Transplanted kheton me 5-7cm paani banaye rakhein; stem rot se bachne ke liye 10cm se zyada paani nikal dein.",
                    "action_telish": "Transplanted polallo 5-7cm neellu unchandi; stem rot rakunda 10cm kante ekkuva unna neetini bayataki pampandi.",
                    "action_mr": "भात खाचरांमध्ये 5-7 सेमी पाणी ठेवा; जास्त पाणी काढून टाका."
                }
            }
        },
        "soybean": {
            "name": "Soybean (सोयाबीन)",
            "advisories": {
                "heavy_rain": {
                    "condition": lambda rain: rain >= 25.0,
                    "action": "Postpone weedicide application. Ensure rapid drainage from flat fields to protect pod development.",
                    "action_hi": "खरपतवार नाशक का प्रयोग टालें। फलियों के विकास की सुरक्षा के लिए खेतों से त्वरित जल निकासी सुनिश्चित करें।",
                    "action_hinglish": "Weedicide ka spray aage badhayein. Pods ki protection ke liye flat kheton se jaldi paani nikalne ka intezam karein.",
                    "action_telish": "Weedicide spray aapi unchandi. Kayala vriddhi kosam flat polallo nundi fast ga neellu drain cheyandi.",
                    "action_mr": "तणनाशकाचा वापर पुढे ढकला. शेतात पाणी साचणार नाही याची काळजी घ्या."
                }
            }
        }
    }

    @staticmethod
    def evaluate_agromet_rules(crop: str, rain_next_24h: float, humidity: float, lang: str = "hi") -> Dict[str, Any]:
        """Evaluates agricultural domain rules against forecast metrics."""
        crop_key = crop.lower().strip()
        matched_crop = None
        for k in RulesEngine.CROP_RULES:
            if k in crop_key or crop_key in k:
                matched_crop = k
                break
        
        if not matched_crop:
            matched_crop = "cotton"  # Default major cash crop

        crop_info = RulesEngine.CROP_RULES[matched_crop]
        recommendations = []

        # Check rain rule
        rain_rule = crop_info["advisories"].get("heavy_rain")
        if rain_rule and rain_rule["condition"](rain_next_24h):
            rec_text = rain_rule.get(f"action_{lang}", rain_rule["action"])
            recommendations.append({
                "category": "Precipitation & Chemical Spraying",
                "severity": "CRITICAL" if rain_next_24h > 40 else "HIGH",
                "text": rec_text,
                "english_text": rain_rule["action"]
            })

        # Check humidity rule
        hum_rule = crop_info["advisories"].get("high_humidity")
        if hum_rule and hum_rule["condition"](humidity):
            rec_text = hum_rule.get(f"action_{lang}", hum_rule["action"])
            recommendations.append({
                "category": "Pest & Disease Defense",
                "severity": "MEDIUM",
                "text": rec_text,
                "english_text": hum_rule["action"]
            })

        if not recommendations:
            if lang == "hi":
                default_text = "मौसम कृषि कार्यों के लिए अनुकूल है। सामान्य सिंचाई और उर्वरक प्रबंधन जारी रखें।"
            elif lang == "hinglish":
                default_text = "Mausam kheti ke kamo ke liye favorable hai. Normal sinchai aur fertilizer management continue rakhein."
            elif lang == "telish":
                default_text = "Mausam vyavasaya panulaku anukulanga undi. Sadharana neeti parudala mariyu eruvula yajamanya thodupaduthundi."
            else:
                default_text = "Weather is suitable for scheduled agronomic operations."

            recommendations.append({
                "category": "General Agronomy",
                "severity": "NORMAL",
                "text": default_text,
                "english_text": "Weather is suitable for scheduled agronomic operations."
            })

        return {
            "crop": crop_info["name"],
            "recommendations": recommendations,
            "rule_source": "ICAR-CRIDA & IMD Agromet Advisory Service (AAS) Bulletin #48"
        }

    @staticmethod
    def evaluate_marine_safety(wind_speed_kmh: float, wave_height_m: float = 2.5) -> Dict[str, Any]:
        """Evaluates fisherman safety based on wind and swell height."""
        is_safe = wind_speed_kmh < 45.0 and wave_height_m < 3.0
        return {
            "is_safe_for_fishing": is_safe,
            "wind_speed_knots": round(wind_speed_kmh * 0.539957, 1),
            "wave_height_m": wave_height_m,
            "advisory": "Safe for coastal & near-shore fishing." if is_safe else "DANGER: High squall winds and rough seas. Fishermen are strictly advised not to venture into deep sea.",
            "source": "INCOIS-IMD Joint Marine Weather Bulletin"
        }

    @staticmethod
    def get_ndma_safety_dos_donts(hazard_type: str, lang: str = "en") -> List[Dict[str, str]]:
        """Returns official NDMA life-safety protocols."""
        hazard = hazard_type.upper()
        if hazard == "CYCLONE":
            return [
                {"type": "DO", "text": "Move immediately to designated pucca cyclone shelters or high ground.", "text_hi": "तुरंत पक्के चक्रवात राहत आश्रयों या ऊंचे स्थानों पर जाएं।"},
                {"type": "DO", "text": "Keep battery-operated radio, torches, drinking water, and essential medicines ready.", "text_hi": "रेडियो, टॉर्च, पीने का पानी और जरूरी दवाइयां पास रखें।"},
                {"type": "DONT", "text": "Do not venture out during the lull period (eye of the cyclone).", "text_hi": "चक्रवात के शांत समय (आई ऑफ साइक्लोन) में बाहर न निकलें।"},
                {"type": "DONT", "text": "Do not touch downed electric wires or damaged poles.", "text_hi": "टूटे हुए बिजली के तारों या खंभों को बिल्कुल न छुएं।"}
            ]
        elif hazard == "HEAVY_RAIN" or hazard == "FLOOD":
            return [
                {"type": "DO", "text": "Move livestock and valuables to upper elevation platforms.", "text_hi": "मवेशियों और कीमती सामान को ऊंचे स्थानों पर ले जाएं।"},
                {"type": "DO", "text": "Drink only boiled or chlorinated water to prevent waterborne epidemics.", "text_hi": "उबला हुआ या क्लोरीनयुक्त पानी ही पिएं।"},
                {"type": "DONT", "text": "Never attempt to walk, swim, or drive through flowing floodwaters.", "text_hi": "बहते बाढ़ के पानी में चलने, तैरने या गाड़ी चलाने की कोशिश न करें।"}
            ]
        return [
            {"type": "DO", "text": "Follow official weather updates from IMD and district authorities.", "text_hi": "मौसम विभाग और जिला प्रशासन के आधिकारिक निर्देशों का पालन करें।"}
        ]
