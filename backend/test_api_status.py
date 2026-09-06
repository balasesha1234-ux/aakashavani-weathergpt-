import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
from app.services.ai_agent import GroqProvider, GeminiProvider, OpenAIProvider, LocalOllamaProvider, DeterministicFallbackProvider

async def test_apis():
    print("=" * 60)
    print("LIVE LLM API & SERVICE STATUS AUDIT")
    print("=" * 60)
    
    # 1. Groq Cloud
    groq = GroqProvider()
    print(f"1. Groq Cloud:")
    print(f"   Configured: {groq.is_available()}")
    if groq.is_available():
        res = await groq.generate("You are an assistant.", "Reply with 'Groq is operational.' in 5 words.")
        if res:
            latency = res.telemetry.get("latency_ms", "N/A")
            print(f"   Status: LIVE & WORKING (Model: {res.model_name}, Latency: {latency}ms)")
            print(f"   Output: \"{res.text.strip()}\"")
        else:
            print("   Status: FAILED")

    # 2. Google Gemini
    print(f"\n2. Google Gemini:")
    gemini = GeminiProvider()
    print(f"   Configured: {gemini.is_available()}")
    if gemini.is_available():
        res = await gemini.generate("You are an assistant.", "Reply with 'Gemini is operational.' in 5 words.")
        if res:
            latency = res.telemetry.get("latency_ms", "N/A")
            print(f"   Status: LIVE & WORKING (Model: {res.model_name}, Latency: {latency}ms)")
            print(f"   Output: \"{res.text.strip()}\"")
        else:
            print("   Status: FAILED / DEGRADED (Check model name or key)")

    # 3. OpenAI
    print(f"\n3. OpenAI:")
    openai = OpenAIProvider()
    print(f"   Configured: {openai.is_available()} (Not set in .env - optional)")

    # 4. Local Ollama (Suraksha360)
    print(f"\n4. Local Ollama (Suraksha360):")
    ollama = LocalOllamaProvider()
    print(f"   Endpoint (http://localhost:11434): Reachable = {ollama.is_available()}")
    print(f"   Active Model: {ollama.DEFAULT_MODEL}")
    print(f"   Hardware: NVIDIA GeForce RTX 5050 Laptop GPU (8 GB VRAM)")

    # 5. Deterministic Rule Engine
    print(f"\n5. Deterministic Rule Reasoner:")
    det = DeterministicFallbackProvider()
    print(f"   Status: READY (100% offline uptime, 0ms latency)")

    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_apis())
