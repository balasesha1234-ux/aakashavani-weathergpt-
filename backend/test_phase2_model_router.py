"""
Phase 2 ModelRouter Test Suite for AakashaVani.
Tests deterministic task-based routing across:
A. "What's the temperature right now?" -> WEATHER
B. "Will it rain tomorrow?" -> FORECAST
C. "Why does humidity make me feel hotter?" -> EDUCATION
D. "Feeling tired today bro" -> GENERAL_CONVERSATION (Local Qwen)
E. "There is a flood warning near me. What should I do?" -> EMERGENCY / SAFETY
F. "Can I travel tomorrow if heavy rain is expected?" -> COMPLEX
G. Telugu weather query -> WEATHER / FORECAST
H. Hinglish weather query -> WEATHER / FORECAST
I. Provider unavailable -> Fallback without crash
J. Local Ollama unavailable -> Fallback without crash
K. Emergency query -> Deterministic emergency data preserved
L. Repeated requests -> Stability / Determinism
"""

import os
import sys
import asyncio
from typing import Dict, Any

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from app.services.ai_agent import (
    TaskClassifier,
    TaskContext,
    ModelRouter,
    GroqProvider,
    GeminiProvider,
    OpenAIProvider,
    LocalOllamaProvider,
    DeterministicFallbackProvider,
    MultiAgentOrchestrator
)


def test_case_a_temperature():
    q = "What's the temperature right now?"
    ctx = TaskClassifier.classify(q)
    assert ctx.task_type == "WEATHER", f"Expected WEATHER, got {ctx.task_type}"
    provider, model, reason = ModelRouter.select_route(ctx)
    assert provider in ["groq", "local_ollama"], f"Unexpected provider {provider}"
    print(f"[PASS] Test A: '{q}' -> Task: {ctx.task_type}, Route: {provider} ({model})")


def test_case_b_forecast():
    q = "Will it rain tomorrow?"
    ctx = TaskClassifier.classify(q)
    assert ctx.task_type == "FORECAST", f"Expected FORECAST, got {ctx.task_type}"
    provider, model, reason = ModelRouter.select_route(ctx)
    assert provider in ["groq", "local_ollama"], f"Unexpected provider {provider}"
    print(f"[PASS] Test B: '{q}' -> Task: {ctx.task_type}, Route: {provider} ({model})")


def test_case_c_education():
    q = "Why does humidity make me feel hotter?"
    ctx = TaskClassifier.classify(q)
    assert ctx.task_type == "EDUCATION", f"Expected EDUCATION, got {ctx.task_type}"
    provider, model, reason = ModelRouter.select_route(ctx)
    assert provider == "local_ollama", f"Expected local_ollama for EDUCATION, got {provider}"
    print(f"[PASS] Test C: '{q}' -> Task: {ctx.task_type}, Route: {provider} ({model})")


def test_case_d_conversation():
    q = "Feeling tired today bro"
    ctx = TaskClassifier.classify(q)
    assert ctx.task_type == "GENERAL_CONVERSATION", f"Expected GENERAL_CONVERSATION, got {ctx.task_type}"
    provider, model, reason = ModelRouter.select_route(ctx)
    assert provider == "local_ollama", f"Expected local_ollama for GENERAL_CONVERSATION, got {provider}"
    assert ctx.requires_rag is False, "Conversational task should not require RAG"
    print(f"[PASS] Test D: '{q}' -> Task: {ctx.task_type}, Route: {provider} ({model})")


def test_case_e_emergency_safety():
    q = "There is a flood warning near me. What should I do?"
    emergency_mock = {
        "is_emergency_active": True,
        "warning": {"severity": "RED", "instructions": "Move to higher ground immediately."}
    }
    ctx = TaskClassifier.classify(q, emergency_status=emergency_mock)
    assert ctx.task_type in ["EMERGENCY", "SAFETY_RISK"], f"Expected EMERGENCY or SAFETY_RISK, got {ctx.task_type}"
    assert ctx.risk_level in ["CRITICAL", "HIGH"], f"Expected elevated risk, got {ctx.risk_level}"
    assert ctx.requires_emergency is True
    provider, model, reason = ModelRouter.select_route(ctx)
    print(f"[PASS] Test E: '{q}' -> Task: {ctx.task_type}, Risk: {ctx.risk_level}, Route: {provider} ({model})")


def test_case_f_complex_conditional():
    q = "Can I travel tomorrow if heavy rain is expected?"
    ctx = TaskClassifier.classify(q)
    assert ctx.task_type == "COMPLEX", f"Expected COMPLEX, got {ctx.task_type}"
    assert ctx.complexity == "COMPLEX", f"Expected COMPLEX complexity, got {ctx.complexity}"
    assert ctx.requires_weather is True
    provider, model, reason = ModelRouter.select_route(ctx)
    print(f"[PASS] Test F: '{q}' -> Task: {ctx.task_type}, Complexity: {ctx.complexity}, Route: {provider} ({model})")


def test_case_g_telugu():
    # 1. Current weather in Telugu
    q1 = "ఇప్పుడు ఉష్ణోగ్రత ఎంత?"
    ctx1 = TaskClassifier.classify(q1)
    assert ctx1.task_type == "WEATHER", f"Expected WEATHER for '{q1}', got {ctx1.task_type}"

    # 2. Forecast in Telugu
    q2 = "రేపు వర్షం పడుతుందా?"
    ctx2 = TaskClassifier.classify(q2)
    assert ctx2.task_type == "FORECAST", f"Expected FORECAST for '{q2}', got {ctx2.task_type}"
    print(f"[PASS] Test G: Telugu classification -> '{q1}'={ctx1.task_type}, '{q2}'={ctx2.task_type}")


def test_case_h_hinglish():
    # 1. Hinglish forecast
    q1 = "kya kal barish hogi?"
    ctx1 = TaskClassifier.classify(q1)
    assert ctx1.task_type == "FORECAST", f"Expected FORECAST for '{q1}', got {ctx1.task_type}"

    # 2. Hinglish weather
    q2 = "aaj temperature kitna hai?"
    ctx2 = TaskClassifier.classify(q2)
    assert ctx2.task_type == "WEATHER", f"Expected WEATHER for '{q2}', got {ctx2.task_type}"
    print(f"[PASS] Test H: Hinglish classification -> '{q1}'={ctx1.task_type}, '{q2}'={ctx2.task_type}")


async def test_case_i_provider_unavailable_fallback():
    task_ctx = TaskContext(
        task_type="WEATHER",
        risk_level="LOW",
        complexity="SIMPLE",
        requires_weather=True,
        requires_rag=False,
        requires_emergency=False,
        primary_intent="GENERAL_WEATHER"
    )
    fb_provider, fb_model = ModelRouter.get_fallback_route(task_ctx, failed_provider="groq")
    assert fb_provider == "local_ollama", f"Expected fallback to local_ollama when cloud fails, got {fb_provider}"

    mock_weather = {"current": {"temperature": 29, "feels_like": 33, "rainfall_mm": 0, "wind_speed_kmh": 14, "humidity": 72, "condition": "Cloudy"}}
    mock_emergency = {"is_emergency_active": False}
    mock_agromet = {"recommendations": [{"text": "Standard farming operations suitable."}]}

    text, tag, conf, meta = await ModelRouter.route_and_generate(
        query="What is the temperature right now?",
        place="Wardha",
        weather=mock_weather,
        emergency=mock_emergency,
        agromet=mock_agromet,
        lang="en"
    )
    assert text and len(text) > 5, "Response text should not be empty"
    print(f"[PASS] Test I: Provider fallback handled cleanly. Response tag: {tag}, Fallback: {meta.get('fallback_used')}")


async def test_case_j_local_ollama_unavailable_fallback():
    task_ctx = TaskContext(
        task_type="GENERAL_CONVERSATION",
        risk_level="LOW",
        complexity="SIMPLE",
        requires_weather=False,
        requires_rag=False,
        requires_emergency=False,
        primary_intent="CONVERSATIONAL"
    )
    fb_provider, fb_model = ModelRouter.get_fallback_route(task_ctx, failed_provider="local_ollama")
    assert fb_provider in ["groq", "gemini", "deterministic_fallback"], f"Unexpected fallback {fb_provider}"
    print(f"[PASS] Test J: Local Ollama unavailable fallback route -> {fb_provider} ({fb_model})")


async def test_case_k_emergency_authoritative():
    res = await MultiAgentOrchestrator.process_conversational_query(
        query="There is a flood warning near me, what should I do?",
        lat=20.7453,
        lon=78.6022,
        district="Wardha",
        language="en"
    )
    assert res["emergency"] is not None, "Emergency payload must not be None"
    assert res["emergency"]["is_emergency_active"] is True
    print(f"[PASS] Test K: Deterministic emergency directives strictly preserved: Severity={res['emergency']['severity']}, Intent={res['intent']}")


def test_case_l_routing_stability():
    queries = [
        ("What's the temperature right now?", "WEATHER"),
        ("Will it rain tomorrow?", "FORECAST"),
        ("Why does humidity make me feel hotter?", "EDUCATION"),
        ("Feeling tired today bro", "GENERAL_CONVERSATION"),
        ("Can I travel tomorrow if heavy rain is expected?", "COMPLEX")
    ]
    for q, expected_task in queries:
        first_route = None
        for iteration in range(10):
            ctx = TaskClassifier.classify(q)
            route = ModelRouter.select_route(ctx)
            if first_route is None:
                first_route = route
            else:
                assert route == first_route, f"Routing instability detected on query '{q}' at iteration {iteration}!"
            assert ctx.task_type == expected_task
    print("[PASS] Test L: Routing stability verified (10 consecutive runs with 100% deterministic consistency)")


async def run_all_tests():
    print("=" * 60)
    print("RUNNING AAKASHAVANI PHASE 2 MODEL ROUTER TEST SUITE")
    print("=" * 60)

    test_case_a_temperature()
    test_case_b_forecast()
    test_case_c_education()
    test_case_d_conversation()
    test_case_e_emergency_safety()
    test_case_f_complex_conditional()
    test_case_g_telugu()
    test_case_h_hinglish()
    await test_case_i_provider_unavailable_fallback()
    await test_case_j_local_ollama_unavailable_fallback()
    await test_case_k_emergency_authoritative()
    test_case_l_routing_stability()

    print("=" * 60)
    print("ALL TESTS (A - L) PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_tests())
