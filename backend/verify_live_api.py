import sys
import httpx
import json

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

queries = [
    {"name": "1. Small Talk", "body": {"query": "feeling tired today bro", "district": "Wardha"}},
    {"name": "2. Weather", "body": {"query": "what is the temperature in Mumbai?", "district": "Wardha"}},
    {"name": "3. Ambiguous", "body": {"query": "Should I go tomorrow?", "district": "Wardha"}},
    {"name": "4. Emergency", "body": {"query": "there is a flood warning near me, what should I do?", "district": "Hyderabad"}}
]

client = httpx.Client(timeout=30.0)
for q in queries:
    resp = client.post("http://localhost:8000/api/chat", json=q["body"])
    data = resp.json()
    orch = data.get("orchestration", {})
    print("=" * 60)
    print("Case:", q["name"])
    print("Status Code:", resp.status_code)
    print("Intent:", data.get("intent"))
    print("Tools Planned:", orch.get("tools_planned"))
    print("Tools Executed:", orch.get("tools_executed"))
    print("Role:", orch.get("selected_role"))
    print("Provider:", orch.get("selected_provider"), "| Model:", orch.get("selected_model"))
    print("Validation Used:", orch.get("validation_used"), "| Model:", orch.get("validation_model"))
    print("Disagreement Detected:", orch.get("disagreement_detected"))
    print("Safety Status:", orch.get("safety_status"))
    clean_snippet = data.get("response_text", "")[:120].encode("ascii", "ignore").decode("ascii")
    print("Response Snippet:", clean_snippet)
    print()
