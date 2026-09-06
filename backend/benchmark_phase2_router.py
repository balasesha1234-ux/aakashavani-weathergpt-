"""
Phase 2 ModelRouter Runtime Benchmark for AakashaVani.
Runs live queries across all canonical task classes and measures actual latency and token metrics.
"""

import os
import sys
import time
import asyncio
from typing import Dict, Any

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv
load_dotenv()

from app.services.ai_agent import (
    TaskClassifier,
    ModelRouter,
    MultiAgentOrchestrator
)


BENCHMARK_QUERIES = [
    {
        "id": "A",
        "category": "WEATHER",
        "query": "What is the temperature right now in Wardha?",
        "notes": "Current telemetry inquiry"
    },
    {
        "id": "B",
        "category": "FORECAST",
        "query": "Will it rain tomorrow in Wardha?",
        "notes": "Temporal forecast inquiry"
    },
    {
        "id": "C",
        "category": "EDUCATION",
        "query": "Why does humidity make me feel hotter?",
        "notes": "Conceptual meteorological science inquiry"
    },
    {
        "id": "D",
        "category": "GENERAL_CONVERSATION",
        "query": "Feeling tired today bro",
        "notes": "Conversational companion inquiry (Local Qwen3-8B)"
    },
    {
        "id": "E",
        "category": "EMERGENCY",
        "query": "There is a flood warning near me. What should I do?",
        "notes": "Active disaster safety inquiry"
    },
    {
        "id": "F",
        "category": "COMPLEX",
        "query": "Can I travel tomorrow if heavy rain is expected?",
        "notes": "Multi-variable conditional decision inquiry"
    },
    {
        "id": "G",
        "category": "MULTILINGUAL_TELUGU",
        "query": "ఇప్పుడు ఉష్ణోగ్రత ఎంత?",
        "notes": "Regional language current weather"
    },
    {
        "id": "H",
        "category": "MULTILINGUAL_HINGLISH",
        "query": "kya kal barish hogi?",
        "notes": "Regional Hinglish forecast inquiry"
    }
]


async def run_benchmark():
    print("=" * 90)
    print("AAKASHAVANI PHASE 2 MODEL ROUTER RUNTIME BENCHMARK")
    print("Hardware: NVIDIA RTX 5050 Laptop GPU (8 GB VRAM) + Groq Cloud Inference")
    print("=" * 90)

    results = []

    for item in BENCHMARK_QUERIES:
        qid = item["id"]
        category = item["category"]
        query = item["query"]
        notes = item["notes"]

        print(f"\n[Running {qid}] ({category}) '{query}' ...")
        t0 = time.time()
        res = await MultiAgentOrchestrator.process_conversational_query(
            query=query,
            lat=20.7453,
            lon=78.6022,
            district="Wardha",
            language="en"
        )
        total_time_ms = int((time.time() - t0) * 1000)

        orch = res.get("orchestration", {})
        task_type = orch.get("task_type", "UNKNOWN")
        provider = orch.get("selected_provider", "UNKNOWN")
        model = orch.get("selected_model", "UNKNOWN")
        fallback_used = orch.get("fallback_used", False)
        fallback_reason = orch.get("fallback_reason")

        # Telemetry extraction
        telemetry = orch.get("telemetry", {})
        model_latency_ms = telemetry.get("latency_ms")
        eval_count = telemetry.get("eval_count")
        prompt_eval_count = telemetry.get("prompt_eval_count")

        tokens_per_sec = None
        if eval_count and model_latency_ms and model_latency_ms > 0:
            tokens_per_sec = round(eval_count / (model_latency_ms / 1000.0), 1)

        result_record = {
            "id": qid,
            "category": category,
            "query": query,
            "task_type": task_type,
            "provider": provider,
            "model": model,
            "fallback_used": fallback_used,
            "fallback_reason": fallback_reason,
            "total_latency_ms": total_time_ms,
            "model_latency_ms": model_latency_ms,
            "eval_count": eval_count,
            "prompt_eval_count": prompt_eval_count,
            "tokens_per_sec": tokens_per_sec,
            "intent": res.get("intent"),
            "response_sample": (res.get("response_text") or "")[:90] + "..."
        }
        results.append(result_record)

        print(f"   -> Task: {task_type} | Route: {provider} ({model}) | Fallback: {fallback_used}")
        print(f"   -> Model Latency: {model_latency_ms} ms | Total End-to-End: {total_time_ms} ms | Tokens/s: {tokens_per_sec}")
        print(f"   -> Response snippet: {result_record['response_sample']}")

    print("\n" + "=" * 90)
    print("BENCHMARK SUMMARY TABLE")
    print("=" * 90)
    header = f"{'ID':<3} | {'Task Class':<18} | {'Provider':<13} | {'Model':<22} | {'Model Lat (ms)':<14} | {'Total (ms)':<10} | {'Tokens/s':<8}"
    print(header)
    print("-" * len(header))
    for r in results:
        m_lat = str(r['model_latency_ms']) if r['model_latency_ms'] is not None else "N/A"
        t_sec = str(r['tokens_per_sec']) if r['tokens_per_sec'] is not None else "N/A"
        print(f"{r['id']:<3} | {r['task_type']:<18} | {r['provider']:<13} | {r['model'][:22]:<22} | {m_lat:<14} | {r['total_latency_ms']:<10} | {t_sec:<8}")
    print("=" * 90)


if __name__ == "__main__":
    asyncio.run(run_benchmark())
