#!/usr/bin/env python3
"""AakashaVani Dataset Generator - Domain-specific training data expansion"""
import json, random
from typing import List, Dict

SYSTEM_PROMPT = "You are AakashaVani, an empathetic conversational AI for weather forecasting, ICAR agromet advisories, and NDMA disaster safety in India."

# Diverse Locations across all agricultural & climatic zones of India
LOCS = [
    "Hyderabad", "Bengaluru", "Delhi", "Mumbai", "Pune", "Chennai", "Wardha", "Guntur", 
    "Thanjavur", "Shimla", "Jaipur", "Warangal", "Visakhapatnam", "Amritsar", "Goa",
    "Nagpur", "Karnal", "Ludhiana", "Patna", "Indore", "Coimbatore", "Guwahati",
    "Bhubaneswar", "Puri", "Kochi", "Varanasi", "Ahmedabad", "Dehradun", "Ranchi", "Srinagar"
]

CROPS = [
    "cotton", "paddy", "wheat", "sugarcane", "soybean", "millet", 
    "mustard", "chickpea", "groundnut", "maize", "turmeric", "tomato", "chilli"
]

ACTIVITIES = [
    "spray pesticide", "harvest", "sow", "irrigate", "apply urea fertilizer", 
    "dry field", "weed the beds", "prune branches", "transplant seedlings"
]

DISASTERS = [
    "cyclone", "flash flood", "lightning & thunderstorm", "heatwave", 
    "dust storm", "cold wave", "cloudburst", "river overflow"
]

# Comprehensive Base Examples across domain scenarios
BASE_EXAMPLES = [
    # General weather
    ("What's the weather in {loc} today?", 
     "{loc} has pleasant conditions with clear skies, 28°C temperature, and moderate winds at 12 km/h. Perfect for outdoor activities."),
    
    ("Will it rain in {loc} today or tomorrow?", 
     "No significant rainfall is forecast for {loc} over the next 24-48 hours. Sky will remain partly cloudy with under 15% probability of precipitation."),
     
    # Agriculture & ICAR Advisory
    ("Can I {act} {crop} in {loc} today?",
     "Take a deep breath and give yourself credit — you worked hard today! The evening weather outside in {loc} is actually cooling down pleasantly to 25°C. A 10-minute quiet walk on the terrace or relaxing with a warm cup of tea by the window will do wonders to reset your energy. Rest well tonight!"),

    ("Hey bro, how are you doing today? What are you up to?",
     "Hey there! I am doing great, actively crunching radar telemetry and monitoring regional weather across India so you don't have to stress. How has your day been going so far? Tell me what's on your mind!"),

    ("Tell me something cool or a fun fact about weather.",
     "Here is a mind-blowing fact: Did you know that a single medium-sized cumulus rain cloud weighs around 500,000 kilograms (about 1.1 million pounds)? That's equal to the weight of about 100 elephants floating peacefully in the sky!")
]

def generate_from_template(template: tuple, locs: List[str], crops: List[str], 
                          activities: List[str], disasters: List[str]) -> List[Dict]:
    """Expand template across all combinations."""
    template_q, template_a = template
    examples = []
    
    # Determine template type and generate variations
    if "{loc}" in template_q:
        for loc in locs:
            for crop in crops:
                for act in activities[:2]:
                    q = template_q.format(loc=loc, crop=crop, act=act, dis=disasters[0])
                    a = template_a.format(loc=loc, crop=crop, act=act, dis=disasters[0])
                    if q not in [e["messages"][1]["content"] for e in examples]:
                        examples.append({
                            "messages": [
                                {"role": "system", "content": SYSTEM_PROMPT},
                                {"role": "user", "content": q},
                                {"role": "assistant", "content": a}
                            ]
                        })
    elif "{dis}" in template_q:
        for dis in disasters:
            q = template_q.format(dis=dis, loc=LOCS[0], crop=CROPS[0], act=ACTIVITIES[0])
            a = template_a.format(dis=dis, loc=LOCS[0], crop=CROPS[0], act=ACTIVITIES[0])
            examples.append({
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": q},
                    {"role": "assistant", "content": a}
                ]
            })
    
    return examples

def main():
    dataset = []
    
    # Generate from base templates
    for template in BASE_EXAMPLES:
        dataset.extend(generate_from_template(template, LOCS, CROPS, ACTIVITIES, DISASTERS))
    
    # Add multilingual equivalents for key patterns
    multilingual = [
        ({"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": "హైదరాబాద్‌లో ఈరోజు ఎలా ఉందీ?"},
         {"role": "assistant", "content": "హైదరాబాద్‌లో ఆకాశం నిర్మలం, ఉష్ణోగ్రత 29°C, గాలి 12 km/h. చాలా ఆరామ్‌గా ఉన్నది."}),
        
        ({"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": "दिल्ली में कल मौसम कैसा रहेगा?"},
         {"role": "assistant", "content": "दिल्ली में कल 34°C रहेगा, कोई बारिश नहीं होगी। कल बाहर निकलने के लिए अच्छा दिन है."}),
         
        ({"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": "नागपूरमध्ये कपासीचे पीक अचानक गंजले आहे. काय उपाय करावे?"},
         {"role": "assistant", "content": "कपासीवर जाणीव अळीचा प्रादुर्भाव आहे. कोरड्या हवामानात शिफारशीत कीटकनाशकाची फवारणी करा."}),

        # Hinglish Daily Chit-Chat & Casual Life
        ({"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": "Bhai aaj office me bohot kaam tha, dimag thak gaya. Sham ka mausam kaisa hai?"},
         {"role": "assistant", "content": "Arrey bhai, aaram se baitho aur ek garam cup chai enjoy karo! Sham ko mausam kaafi thanda aur pleasant hone wala hai around 26°C with thandi hawa. Terrace pe thoda time walk karoge to mind ekdum fresh ho jayega!"}),

        ({"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": "Aaj kapde dhoke bahar sukha sakte hain kya?"},
         {"role": "assistant", "content": "Haan bilkul! Aaj dhoop achhi nikli hai aur barish ka koi chance nahi hai. Kapde 3-4 ghante me mast sukh jayenge. Sham hone se pehle andar le aana taaki os na pade."}),

        # Telish Daily Chit-Chat & Casual Life
        ({"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": "Babu ee roju exam ayyaka friends tho cricket aadadaniki velthunna, weather set avtunda?"},
         {"role": "assistant", "content": "Super bro, exams ayipoyina ventane cricket aadtam kante best stress buster inkoti undadu! Weather chala bavundi, 27°C daggara undi mariyu rain chances chala takkuva. Manchi match enjoy cheyandi, water bottle marchipovaddu!"})
    ]
    
    for sys, usr, asst in multilingual:
        dataset.append({"messages": [sys, usr, asst]})
    
    # Add conversational continuity examples
    continuations = [
        {"messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Based on the forecast, when should I spray crops?"},
            {"role": "assistant", "content": "Wait for the clearing window in 48 hours. That's your best window for optimal pesticide effectiveness."}
        ]},
        {"messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "You mentioned high humidity. Will that affect harvesting?"},
            {"role": "assistant", "content": "High humidity slows drying. Wait for drier conditions (humidity < 60%) to harvest and dry field crops properly."}
        ]},
    ]
    dataset.extend(continuations)
    
    # Deduplicate
    unique = []
    seen = set()
    for ex in dataset:
        key = (ex["messages"][1]["content"], ex["messages"][2]["content"])
        if key not in seen:
            unique.append(ex)
            seen.add(key)
    
    dataset = unique
    print(f"[+] Generated {len(dataset)} unique examples")
    
    # Split 80/10/10
    random.seed(42)
    random.shuffle(dataset)
    
    train = dataset[:int(0.8*len(dataset))]
    val = dataset[int(0.8*len(dataset)):int(0.9*len(dataset))]
    test = dataset[int(0.9*len(dataset)):]
    
    print(f"[+] Train: {len(train)} | Val: {len(val)} | Test: {len(test)}")
    
    for fname, data in [("train.jsonl", train), ("validation.jsonl", val), ("test.jsonl", test)]:
        with open(fname, "w", encoding="utf-8") as f:
            for ex in data:
                f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    
    print("[SUCCESS] Saved: train.jsonl, validation.jsonl, test.jsonl")

if __name__ == "__main__":
    main()
