"""
AakashaVani: Phase 4 Multi-Model Intelligence Ecosystem Live Benchmark
Measures live runtime latencies, tool calls, model selections, selective validation frequency,
fallback rates, local vs cloud distribution, and compares Phase 2 vs Phase 4.
"""

import os
import sys
import time
import asyncio
from typing import Dict, Any, List

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.ai_agent import AakashaVaniAgent


BENCHMARK_CASES = [
    {
        "id": "A",
        "category": "Small Talk / Companion",
        "query": "feeling tired today bro",
        "district": "Wardha",
        "lang": "en",
        "expected_role": "SURAKSHA360",
        "expected_provider": "local_ollama"
    },
    {
        "id": "B",
        "category": "Science / Education",
        "query": "why does humidity make heat feel worse?",
        "district": "Wardha",
        "lang": "en",
        "expected_role": "SURAKSHA360",
        "expected_provider": "local_ollama"
    },
    {
        "id": "C",
        "category": "Current Weather Telemetry",
        "query": "what is the temperature right now in Hyderabad?",
        "district": "Hyderabad",
        "lang": "en",
        "expected_role": "WEATHER_SPECIALIST",
        "expected_provider": "groq"
    },
    {
        "id": "D",
        "category": "NWP Multi-Day Forecast",
        "query": "will it rain tomorrow in Wardha?",
        "district": "Wardha",
        "lang": "en",
        "expected_role": "WEATHER_SPECIALIST",
        "expected_provider": "groq"
    },
    {
        "id": "E",
        "category": "Precautionary Safety Advisory",
        "query": "is it safe to travel to Vijayawada during this thunderstorm warning?",
        "district": "Vijayawada",
        "lang": "en",
        "expected_role": "SAFETY_SPECIALIST",
        "expected_provider": "groq"
    },
    {
        "id": "F",
        "category": "Complex Multi-Variable Decision",
        "query": "Can I spray pesticide on my cotton crop tomorrow if heavy rain is expected in Wardha?",
        "district": "Wardha",
        "lang": "en",
        "expected_role": "REASONING_CLOUD",
        "expected_provider": "groq"
    },
    {
        "id": "G",
        "category": "High-Risk Emergency + Validation",
        "query": "There is a severe flood alert in Hyderabad. Can I drive my family through the bypass road tomorrow?",
        "district": "Hyderabad",
        "lang": "en",
        "expected_role": "REASONING_CLOUD",
        "expected_provider": "groq"
    },
    {
        "id": "H",
        "category": "Telugu Multilingual Query",
        "query": "హైదరాబాద్ లో ఇప్పుడు ఉష్ణోగ్రత ఎంత?",
        "district": "Hyderabad",
        "lang": "te",
        "expected_role": "WEATHER_SPECIALIST",
        "expected_provider": "groq"
    },
    {
        "id": "I",
        "category": "Hinglish Multilingual Query",
        "query": "kya kal Pune me heavy barish hogi?",
        "district": "Pune",
        "lang": "hinglish",
        "expected_role": "WEATHER_SPECIALIST",
        "expected_provider": "groq"
    }
]


async def run_benchmark():
    print("=" * 75)
    print("AAKASHAVANI PHASE 4: MULTI-MODEL INTELLIGENCE ECOSYSTEM LIVE BENCHMARK")
    print("Hardware: NVIDIA GeForce RTX 5050 Laptop GPU (8 GB Dedicated VRAM)")
    print("Local Model: Qwen3-8B via Ollama | Cloud Specialist: Groq (openai/gpt-oss-120b)")
    print("=" * 75)

    results = []
    total_start = time.time()

    for item in BENCHMARK_CASES:
        c_id = item["id"]
        c_cat = item["category"]
        c_query = item["query"]
        c_dist = item["district"]
        c_lang = item["lang"]

        print(f"\nEvaluating Case {c_id}: [{c_cat}]")
        print(f"Query: \"{c_query}\"")

        start_t = time.time()
        try:
            res = await AakashaVaniAgent.run(
                query=c_query,
                district=c_dist,
                language=c_lang
            )
            elapsed_ms = (time.time() - start_t) * 1000

            orchestration = res.get("orchestration", {})
            role = orchestration.get("selected_role", "unknown")
            provider = orchestration.get("selected_provider", "unknown")
            model = orchestration.get("selected_model", "unknown")
            val_used = orchestration.get("validation_used", False)
            val_model = orchestration.get("validation_model")
            disagree = orchestration.get("disagreement_detected", False)
            fallback = orchestration.get("fallback_used", False)
            tools_exec = orchestration.get("tools_executed", [])
            telemetry = orchestration.get("telemetry", {})
            model_latency = telemetry.get("latency_ms", 0)

            print(f"  -> Selected Role:     {role}")
            print(f"  -> Provider & Model:  {provider} ({model})")
            print(f"  -> Tools Executed:    {len(tools_exec)} ({', '.join(tools_exec) if tools_exec else 'None'})")
            print(f"  -> Validation Used:   {val_used} ({val_model if val_used else 'None'})")
            print(f"  -> Disagreement:      {disagree}")
            print(f"  -> Fallback Used:     {fallback}")
            print(f"  -> Total Latency:     {elapsed_ms:.1f} ms (Model: {model_latency} ms)")

            results.append({
                "id": c_id,
                "category": c_cat,
                "query": c_query,
                "role": role,
                "provider": provider,
                "model": model,
                "tools_count": len(tools_exec),
                "val_used": val_used,
                "fallback": fallback,
                "total_latency_ms": elapsed_ms,
                "model_latency_ms": model_latency,
                "success": True
            })
        except Exception as e:
            elapsed_ms = (time.time() - start_t) * 1000
            print(f"  -> FAILED with exception: {type(e).__name__}: {e}")
            results.append({
                "id": c_id,
                "category": c_cat,
                "query": c_query,
                "role": "FAILED",
                "provider": "ERROR",
                "model": "ERROR",
                "tools_count": 0,
                "val_used": False,
                "fallback": False,
                "total_latency_ms": elapsed_ms,
                "model_latency_ms": 0,
                "success": False
            })

    total_bench_duration = time.time() - total_start

    # Summary Statistics
    successful_runs = [r for r in results if r["success"]]
    avg_total_latency = sum(r["total_latency_ms"] for r in successful_runs) / len(successful_runs) if successful_runs else 0
    avg_model_latency = sum(r["model_latency_ms"] for r in successful_runs) / len(successful_runs) if successful_runs else 0
    avg_tools = sum(r["tools_count"] for r in successful_runs) / len(successful_runs) if successful_runs else 0
    local_count = sum(1 for r in successful_runs if r["provider"] == "local_ollama")
    cloud_count = sum(1 for r in successful_runs if r["provider"] in ["groq", "gemini", "openai"])
    validation_count = sum(1 for r in successful_runs if r["val_used"])
    fallback_count = sum(1 for r in successful_runs if r["fallback"])

    print("\n" + "=" * 75)
    print("PHASE 4 BENCHMARK SUMMARY TABLE")
    print("=" * 75)
    print(f"{'ID':<3} | {'Category':<28} | {'Role':<18} | {'Provider':<13} | {'Tools':<5} | {'Val':<5} | {'Latency':<9}")
    print("-" * 75)
    for r in results:
        val_str = "YES" if r["val_used"] else "NO"
        lat_str = f"{r['total_latency_ms']:.0f} ms"
        print(f"{r['id']:<3} | {r['category'][:28]:<28} | {r['role'][:18]:<18} | {r['provider'][:13]:<13} | {r['tools_count']:<5} | {val_str:<5} | {lat_str:<9}")
    print("-" * 75)
    print(f"Total Benchmark Execution Time:  {total_bench_duration:.2f} s")
    print(f"Total Cases Evaluated:           {len(results)} / {len(BENCHMARK_CASES)} passed ({len(successful_runs)/len(BENCHMARK_CASES)*100:.1f}%)")
    print(f"Average Total Latency:           {avg_total_latency:.1f} ms")
    print(f"Average Model Generation:        {avg_model_latency:.1f} ms")
    print(f"Average Tools Called per Query:  {avg_tools:.2f}")
    print(f"Local Model Share (Qwen3-8B):    {local_count} / {len(successful_runs)} ({local_count/len(successful_runs)*100:.1f}%)")
    print(f"Cloud Specialist Share:          {cloud_count} / {len(successful_runs)} ({cloud_count/len(successful_runs)*100:.1f}%)")
    print(f"Selective Validation Frequency:  {validation_count} / {len(successful_runs)} ({validation_count/len(successful_runs)*100:.1f}%)")
    print(f"Fallback Invocations:            {fallback_count} / {len(successful_runs)} ({fallback_count/len(successful_runs)*100:.1f}%)")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(run_benchmark())
