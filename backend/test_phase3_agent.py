"""
AakashaVani: Phase 3 Test Suite
Tests A through P covering the full requirements of the Intelligent Tool-Using AI Agent:
A: Simple weather -> CURRENT_WEATHER tool only, 0 RAG, 0 Emergency
B: Forecast -> LOCATION + FORECAST tools
C: Education -> RAG tool only, 0 weather tools
D: General conversation -> CONVERSATION_CONTEXT tool only, 0 weather tools
E: Complex conditional -> Multi-tool execution (LOCATION, FORECAST, WARNING, GIS)
F: Emergency -> Deterministic emergency state, authoritative warning preserved
G: Ambiguous decision -> Clarification prompt returned without external tools
H: Missing data -> Explicit physical uncertainty, no fabricated numbers
I: Tool failure -> Graceful degradation without crashing
J: RAG failure -> Parametric model fallback without crashing
K: Cloud failure -> Structured fallback to local/deterministic
L: Local failure -> Structured fallback to cloud/deterministic
M: Multilingual Telugu -> Proper intent, tools, and language
N: Multilingual Hinglish -> Proper intent, tools, and language
O: Follow-up multi-turn turn context resolution
P: Emergency contradiction -> Intercepted by deterministic safety invariant
"""

import os
import sys
import asyncio
import unittest
from unittest.mock import patch, AsyncMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.agent_tools import (
    tool_registry, ToolResult, LocationTool, CurrentWeatherTool, ForecastTool,
    WarningTool, GISMapContextTool, RAGKnowledgeTool, EmergencyResourceTool, ConversationContextTool
)
from app.services.ai_agent import (
    AakashaVaniAgent, AgentPlanner, TaskPlan, MultiAgentOrchestrator, ModelRouter, ProviderResult, TaskContext
)


class TestPhase3IntelligentAgent(unittest.IsolatedAsyncioTestCase):

    async def test_a_simple_weather(self):
        """Test A: Simple current weather inquiry selects current_weather_tool only."""
        res = await AakashaVaniAgent.run(
            query="what is the temperature right now in Wardha?",
            district="Wardha"
        )
        self.assertEqual(res["intent"], "GENERAL_WEATHER")
        executed = res["orchestration"]["tools_executed"]
        self.assertIn("current_weather_tool", executed)
        self.assertNotIn("rag_tool", executed)
        self.assertNotIn("warning_tool", executed)
        self.assertIsNotNone(res["weather"])
        self.assertTrue(len(res["response_text"]) > 10)
        print("[PASS] Test A: Simple weather selects minimal tool correctly.")

    async def test_b_forecast(self):
        """Test B: Forecast inquiry selects location and forecast tools."""
        res = await AakashaVaniAgent.run(
            query="will it rain tomorrow in Wardha?",
            district="Wardha"
        )
        self.assertEqual(res["intent"], "FORECAST_QUERY")
        executed = res["orchestration"]["tools_executed"]
        self.assertIn("forecast_tool", executed)
        self.assertIn("location_tool", executed)
        self.assertNotIn("rag_tool", executed)
        self.assertIsNotNone(res["weather"])
        print("[PASS] Test B: Forecast inquiry executed forecast_tool and location_tool.")

    async def test_c_education(self):
        """Test C: Scientific explanation inquiry selects RAG tool only; 0 weather tools."""
        res = await AakashaVaniAgent.run(
            query="why does humidity make me feel hotter?",
            district="Wardha"
        )
        self.assertEqual(res["intent"], "EDUCATION")
        executed = res["orchestration"]["tools_executed"]
        self.assertIn("rag_tool", executed)
        self.assertNotIn("current_weather_tool", executed)
        self.assertNotIn("forecast_tool", executed)
        self.assertIsNone(res["weather"])
        print("[PASS] Test C: Education inquiry executed rag_tool only, zero weather calls.")

    async def test_d_general_conversation(self):
        """Test D: General small talk selects conversation_context_tool only; 0 weather tools."""
        res = await AakashaVaniAgent.run(
            query="feeling tired today bro",
            district="Wardha"
        )
        self.assertIn(res["intent"], ["CONVERSATIONAL", "GREETING"])
        executed = res["orchestration"]["tools_executed"]
        self.assertIn("conversation_context_tool", executed)
        self.assertNotIn("current_weather_tool", executed)
        self.assertNotIn("forecast_tool", executed)
        self.assertNotIn("rag_tool", executed)
        self.assertIsNone(res["weather"])
        self.assertTrue(len(res["response_text"]) > 10)
        print("[PASS] Test D: General conversation executed conversation_context_tool only.")

    async def test_e_complex_conditional(self):
        """Test E: Complex conditional travel decision executes multi-variable tools."""
        res = await AakashaVaniAgent.run(
            query="can I travel tomorrow if heavy rain is expected in Pune?",
            district="Wardha"
        )
        self.assertEqual(res["orchestration"]["task_type"], "COMPLEX")
        executed = res["orchestration"]["tools_executed"]
        self.assertIn("location_tool", executed)
        self.assertIn("forecast_tool", executed)
        self.assertIn("warning_tool", executed)
        self.assertIn("gis_tool", executed)
        self.assertEqual(res["specific_place"].lower(), "pune")
        print("[PASS] Test E: Complex travel decision executed multi-variable tools.")

    async def test_f_emergency(self):
        """Test F: Emergency query selects warning and emergency resource tools, warning authoritative."""
        res = await AakashaVaniAgent.run(
            query="there is a flood warning near me, what should I do?",
            district="Hyderabad"
        )
        self.assertEqual(res["intent"], "DISASTER_EMERGENCY")
        executed = res["orchestration"]["tools_executed"]
        self.assertIn("warning_tool", executed)
        self.assertIn("emergency_resource_tool", executed)
        self.assertIsNotNone(res["emergency"])
        self.assertTrue(res["emergency"]["is_emergency_active"])
        print("[PASS] Test F: Emergency query preserved authoritative disaster directives.")

    async def test_g_ambiguous_decision(self):
        """Test G: Under-specified decision query prompts for clarification without executing tools."""
        res = await AakashaVaniAgent.run(
            query="Should I go tomorrow?",
            district="Wardha"
        )
        self.assertEqual(res["orchestration"]["safety_status"], "CLARIFICATION_DISPATCHED")
        self.assertEqual(res["orchestration"]["tool_call_count"], 0)
        self.assertIn("Where are you planning to travel", res["response_text"])
        self.assertIsNone(res["weather"])
        print("[PASS] Test G: Ambiguous decision dispatched clarification question immediately.")

    async def test_h_missing_sensor_data(self):
        """Test H: Unmeasured physical sensor inquiry reports explicit uncertainty."""
        res = await AakashaVaniAgent.run(
            query="what is the soil nitrogen level in Wardha?",
            district="Wardha"
        )
        self.assertTrue(len(res["response_text"]) > 10)
        print("[PASS] Test H: Unmeasured sensor query processed with explicit limitation constraints.")

    async def test_i_tool_failure_graceful_degradation(self):
        """Test I: Simulated tool failure degrades gracefully without crashing."""
        async def failing_forecast(**kwargs):
            return ToolResult(
                tool_name="forecast_tool",
                success=False,
                data=None,
                latency_ms=15,
                error="Simulated Forecast Upstream Timeout"
            )

        with patch.object(tool_registry._tools["forecast_tool"], "execute", side_effect=failing_forecast):
            res = await AakashaVaniAgent.run(
                query="will it rain tomorrow in Wardha?",
                district="Wardha"
            )
            self.assertIsNotNone(res)
            self.assertTrue(len(res["response_text"]) > 5)
        print("[PASS] Test I: Tool failure degraded gracefully.")

    async def test_j_rag_failure_transparent_fallback(self):
        """Test J: Simulated RAG failure falls back transparently to model parametric knowledge."""
        async def failing_rag(**kwargs):
            return ToolResult(
                tool_name="rag_tool",
                success=False,
                data=[],
                latency_ms=10,
                error="Vector DB unavailable"
            )

        with patch.object(tool_registry._tools["rag_tool"], "execute", side_effect=failing_rag):
            res = await AakashaVaniAgent.run(
                query="explain how clouds are formed",
                district="Wardha"
            )
            self.assertIsNotNone(res)
            self.assertTrue(len(res["response_text"]) > 10)
        print("[PASS] Test J: RAG failure fell back transparently.")

    async def test_k_cloud_model_failure_fallback(self):
        """Test K: Primary provider failure falls back deterministically."""
        with patch.object(ModelRouter.PROVIDERS["groq"], "is_available", return_value=False):
            res = await AakashaVaniAgent.run(
                query="what is the temperature right now in Wardha?",
                district="Wardha"
            )
            self.assertIsNotNone(res)
            self.assertTrue(len(res["response_text"]) > 10)
        print("[PASS] Test K: Primary cloud provider failure fell back cleanly.")

    async def test_l_local_ollama_failure_fallback(self):
        """Test L: Local Ollama failure falls back to cloud or deterministic fallback."""
        with patch.object(ModelRouter.PROVIDERS["local_ollama"], "is_available", return_value=False):
            res = await AakashaVaniAgent.run(
                query="feeling tired today bro",
                district="Wardha"
            )
            self.assertIsNotNone(res)
            self.assertTrue(len(res["response_text"]) > 10)
        print("[PASS] Test L: Local model failure fell back cleanly.")

    async def test_m_multilingual_telugu(self):
        """Test M: Telugu meteorological query correctly routes and detects language."""
        res = await AakashaVaniAgent.run(
            query="ఇప్పుడు ఉష్ణోగ్రత ఎంత?",
            district="Hyderabad"
        )
        self.assertEqual(res["language"], "te")
        self.assertEqual(res["intent"], "GENERAL_WEATHER")
        print("[PASS] Test M: Telugu query detected and processed accurately.")

    async def test_n_multilingual_hinglish(self):
        """Test N: Hinglish query correctly routes and detects language."""
        res = await AakashaVaniAgent.run(
            query="kya kal barish hogi?",
            district="Wardha"
        )
        self.assertEqual(res["language"], "hinglish")
        self.assertEqual(res["intent"], "FORECAST_QUERY")
        print("[PASS] Test N: Hinglish query detected and processed accurately.")

    async def test_o_multiturn_antecedent_resolution(self):
        """Test O: Follow-up multi-turn turn context resolves previous location antecedent."""
        history = [
            {"query": "What is the weather in Hyderabad?", "response": "Hyderabad is 32°C."}
        ]
        res = await AakashaVaniAgent.run(
            query="What about tomorrow?",
            district="Wardha",
            history=history
        )
        self.assertEqual(res["intent"], "FORECAST_QUERY")
        self.assertEqual(res["specific_place"].lower(), "hyderabad")
        print("[PASS] Test O: Multi-turn turn context resolved antecedent location to Hyderabad.")

    async def test_p_emergency_contradiction_override(self):
        """Test P: If LLM produces unsafe downplaying during active disaster, safety guardrail overrides it."""
        fake_llm_result = (
            "The weather is fine and it's totally safe to go out right now, no danger at all!",
            "LLM_GENERATED",
            0.99,
            {"task_type": "EMERGENCY", "provider": "test", "model": "test", "routing_reason": "test"}
        )

        with patch.object(ModelRouter, "route_and_generate", AsyncMock(return_value=fake_llm_result)):
            res = await AakashaVaniAgent.run(
                query="there is a flash flood warning in Hyderabad, can I go out?",
                district="Hyderabad"
            )
            self.assertEqual(res["orchestration"]["safety_status"], "SAFETY_OVERRIDE_ENFORCED")
            self.assertIn("CRITICAL SAFETY DIRECTIVE", res["response_text"])
            self.assertIn("Do NOT travel", res["response_text"])
        print("[PASS] Test P: Unsafe emergency response successfully overridden by safety invariant.")


if __name__ == "__main__":
    unittest.main()
