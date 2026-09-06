"""
AakashaVani: Phase 4 Test Suite
Tests A through R covering the complete Multi-Model Intelligence Ecosystem:
TEST A: Simple general query -> Local Qwen preferred.
TEST B: Simple educational query -> Local Qwen preferred.
TEST C: Current weather query -> Weather specialist selected.
TEST D: Forecast query -> Weather specialist selected.
TEST E: Safety/risk query -> Safety specialist selected.
TEST F: Emergency warning query -> Official deterministic warning path remains authoritative.
TEST G: Complex reasoning query -> Reasoning specialist selected.
TEST H: Telugu query -> Language-capable model selected.
TEST I: Hinglish query -> Language-capable model selected.
TEST J: Preferred model unavailable -> Capable fallback selected.
TEST K: All cloud unavailable -> Local Qwen used where appropriate.
TEST L: Local Qwen unavailable -> Cloud fallback used.
TEST M: High-risk query -> Safety validation remains enabled.
TEST N: Conflicting model outputs -> Verified evidence overrides unsupported model claims.
TEST O: Selective validation -> Secondary model is NOT called for ordinary low-risk queries.
TEST P: High-risk complex query -> Secondary validation may be invoked.
TEST Q: Emergency with conflicting model output -> Official warning/evidence remains authoritative.
TEST R: Routing stability -> Stable routing across repeated queries.
"""

import os
import sys
import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.model_ecosystem import (
    ModelCapability,
    ModelDescriptor,
    ModelRegistry,
    MultiModelValidator,
    DisagreementResolver,
    model_registry
)
from app.services.ai_agent import (
    AakashaVaniAgent,
    AgentPlanner,
    TaskPlan,
    TaskContext,
    TaskClassifier,
    ModelRouter,
    ProviderResult
)


class TestPhase4MultiModelEcosystem(unittest.IsolatedAsyncioTestCase):

    async def test_a_simple_general_query(self):
        """TEST A: Simple general query -> Local Qwen preferred."""
        res = await AakashaVaniAgent.run(
            query="feeling tired today bro",
            district="Wardha"
        )
        orchestration = res["orchestration"]
        self.assertEqual(orchestration["selected_provider"], "local_ollama")
        self.assertIn(orchestration["selected_model"], ["suraksha360", "qwen3:8b"])
        self.assertIn(orchestration["selected_role"], ["SURAKSHA360", "LOCAL_QWEN"])
        print("[PASS] Test A: Simple general query selected Local Suraksha360.")

    async def test_b_simple_educational_query(self):
        """TEST B: Simple educational query -> Local Suraksha360 preferred."""
        res = await AakashaVaniAgent.run(
            query="why does humidity make me feel hotter?",
            district="Wardha"
        )
        orchestration = res["orchestration"]
        self.assertEqual(orchestration["selected_provider"], "local_ollama")
        self.assertIn(orchestration["selected_model"], ["suraksha360", "qwen3:8b"])
        self.assertIn(orchestration["selected_role"], ["SURAKSHA360", "LOCAL_QWEN"])
        print("[PASS] Test B: Simple educational query selected Local Suraksha360.")

    async def test_c_current_weather_query(self):
        """TEST C: Current weather query -> Weather specialist selected."""
        res = await AakashaVaniAgent.run(
            query="what is the temperature right now in Hyderabad?",
            district="Hyderabad"
        )
        orchestration = res["orchestration"]
        self.assertEqual(orchestration["selected_role"], "WEATHER_SPECIALIST")
        self.assertEqual(orchestration["selected_provider"], "groq")
        self.assertIn("openai/gpt-oss-120b", orchestration["selected_model"])
        print("[PASS] Test C: Current weather query selected Weather Specialist (Groq 120B).")

    async def test_d_forecast_query(self):
        """TEST D: Forecast query -> Weather specialist selected."""
        res = await AakashaVaniAgent.run(
            query="will it rain tomorrow in Wardha?",
            district="Wardha"
        )
        orchestration = res["orchestration"]
        self.assertEqual(orchestration["selected_role"], "WEATHER_SPECIALIST")
        self.assertEqual(orchestration["selected_provider"], "groq")
        print("[PASS] Test D: Forecast query selected Weather Specialist.")

    async def test_e_safety_risk_query(self):
        """TEST E: Safety/risk query -> Safety specialist selected."""
        res = await AakashaVaniAgent.run(
            query="Is it safe to drive to Vijayawada during this heavy thunderstorm warning?",
            district="Vijayawada"
        )
        orchestration = res["orchestration"]
        # Safety/risk or complex reasoning specialist
        self.assertIn(orchestration["selected_role"], ["SAFETY_SPECIALIST", "REASONING_CLOUD"])
        self.assertEqual(orchestration["selected_provider"], "groq")
        print("[PASS] Test E: Safety/risk query selected Safety/Reasoning Specialist.")

    async def test_f_emergency_warning_authoritative(self):
        """TEST F: Emergency warning query -> Official deterministic warning path remains authoritative."""
        res = await AakashaVaniAgent.run(
            query="There is a critical flood alert in Hyderabad, what is the official directive?",
            district="Hyderabad"
        )
        self.assertEqual(res["intent"], "DISASTER_EMERGENCY")
        self.assertIsNotNone(res["emergency"])
        self.assertTrue(res["emergency"]["is_emergency_active"])
        self.assertIn("CRITICAL FLASH FLOOD", res["emergency"]["warning"]["instructions"])
        self.assertIn(res["orchestration"]["safety_status"], ["VERIFIED", "SAFETY_OVERRIDE_ENFORCED"])
        print("[PASS] Test F: Emergency warning query preserved official directive as authoritative.")

    async def test_g_complex_reasoning_query(self):
        """TEST G: Complex reasoning query -> Reasoning specialist selected."""
        res = await AakashaVaniAgent.run(
            query="Can I spray pesticide on my cotton crop tomorrow if heavy rain is expected in Wardha?",
            district="Wardha"
        )
        orchestration = res["orchestration"]
        self.assertEqual(orchestration["selected_role"], "REASONING_CLOUD")
        self.assertEqual(orchestration["selected_provider"], "groq")
        print("[PASS] Test G: Complex multi-variable reasoning query selected Reasoning Cloud Specialist.")

    async def test_h_telugu_query(self):
        """TEST H: Telugu query -> Language-capable model selected."""
        res = await AakashaVaniAgent.run(
            query="హైదరాబాద్ లో ఇప్పుడు ఉష్ణోగ్రత ఎంత?",
            district="Hyderabad",
            language="te"
        )
        orchestration = res["orchestration"]
        self.assertEqual(res["language"], "te")
        self.assertIn(orchestration["selected_role"], ["WEATHER_SPECIALIST", "SURAKSHA360", "LOCAL_QWEN"])
        print("[PASS] Test H: Telugu query selected Language-capable model.")

    async def test_i_hinglish_query(self):
        """TEST I: Hinglish query -> Language-capable model selected."""
        res = await AakashaVaniAgent.run(
            query="kya kal Pune me heavy barish hogi?",
            district="Pune",
            language="hinglish"
        )
        orchestration = res["orchestration"]
        self.assertEqual(res["language"], "hinglish")
        self.assertEqual(orchestration["selected_role"], "WEATHER_SPECIALIST")
        print("[PASS] Test I: Hinglish query selected Language-capable Weather Specialist.")

    async def test_j_preferred_model_unavailable(self):
        """TEST J: Preferred model unavailable -> Capable fallback selected."""
        task_ctx = TaskContext(
            task_type="WEATHER",
            risk_level="LOW",
            complexity="SIMPLE",
            requires_weather=True,
            requires_rag=False,
            requires_emergency=False,
            primary_intent="GENERAL_WEATHER"
        )
        # Simulate Groq unavailable
        fb_provider, fb_model, fb_desc = ModelRouter.get_fallback_route(
            task_ctx=task_ctx,
            failed_provider="groq"
        )
        self.assertNotEqual(fb_provider, "groq")
        self.assertIn(fb_provider, ["local_ollama", "gemini", "openai", "deterministic_fallback"])
        print(f"[PASS] Test J: Preferred model unavailable triggered capable fallback: {fb_provider} ({fb_model}).")

    async def test_k_all_cloud_unavailable(self):
        """TEST K: All cloud unavailable -> Local Suraksha360 used where appropriate."""
        task_ctx = TaskContext(
            task_type="EDUCATION",
            risk_level="LOW",
            complexity="SIMPLE",
            requires_weather=False,
            requires_rag=True,
            requires_emergency=False,
            primary_intent="EDUCATION"
        )
        fb_provider, fb_model, fb_desc = ModelRouter.get_fallback_route(
            task_ctx=task_ctx,
            failed_provider="groq",
            exclude_providers={"groq", "gemini", "openai"}
        )
        self.assertEqual(fb_provider, "local_ollama")
        self.assertIn(fb_model, ["suraksha360", "qwen3:8b"])
        print("[PASS] Test K: All cloud excluded -> Sovereign Local Suraksha360 selected.")

    async def test_l_local_qwen_unavailable(self):
        """TEST L: Local Qwen unavailable -> Cloud fallback used."""
        task_ctx = TaskContext(
            task_type="GENERAL_CONVERSATION",
            risk_level="LOW",
            complexity="SIMPLE",
            requires_weather=False,
            requires_rag=False,
            requires_emergency=False,
            primary_intent="CONVERSATIONAL"
        )
        fb_provider, fb_model, fb_desc = ModelRouter.get_fallback_route(
            task_ctx=task_ctx,
            failed_provider="local_ollama",
            exclude_providers={"local_ollama"}
        )
        self.assertNotEqual(fb_provider, "local_ollama")
        self.assertIn(fb_provider, ["groq", "gemini", "openai", "deterministic_fallback"])
        print(f"[PASS] Test L: Local Qwen unavailable -> Capable cloud fallback: {fb_provider}.")

    async def test_m_high_risk_query_safety_validation(self):
        """TEST M: High-risk query -> Safety validation remains enabled."""
        should_val = MultiModelValidator.should_validate(risk_level="CRITICAL", complexity="COMPLEX")
        self.assertTrue(should_val)
        print("[PASS] Test M: High-risk complex query has safety validation enabled.")

    async def test_n_conflicting_model_outputs_evidence_overrides(self):
        """TEST N: Conflicting model outputs -> Verified evidence overrides unsupported model claims."""
        weather_evidence = {"current": {"temperature": 28, "rainfall_mm": 0.0}}
        emergency_evidence = {"is_emergency_active": False}
        primary_text = "The temperature right now in Wardha is 45°C with severe heat."
        
        resolved_text, disagreement, note = DisagreementResolver.resolve(
            primary_text=primary_text,
            validator_text="Disagreement: live telemetry shows temperature is 28°C.",
            weather_evidence=weather_evidence,
            emergency_evidence=emergency_evidence,
            place="Wardha"
        )
        self.assertTrue(disagreement)
        self.assertIn("28°C", resolved_text)
        self.assertNotIn("45°C", resolved_text)
        print("[PASS] Test N: Verified telemetry overrode contradictory model claim.")

    async def test_o_selective_validation_low_risk(self):
        """TEST O: Selective validation -> Secondary model is NOT called for ordinary low-risk queries."""
        should_val_weather = MultiModelValidator.should_validate(risk_level="LOW", complexity="SIMPLE")
        should_val_chat = MultiModelValidator.should_validate(risk_level="LOW", complexity="SIMPLE")
        self.assertFalse(should_val_weather)
        self.assertFalse(should_val_chat)
        print("[PASS] Test O: Ordinary low-risk queries correctly bypass secondary validation.")

    async def test_p_high_risk_complex_query_selective_validation(self):
        """TEST P: High-risk complex query -> Secondary validation invoked or active."""
        res = await AakashaVaniAgent.run(
            query="There is a severe flood alert in Hyderabad. Can I drive my family through the bypass road tomorrow?",
            district="Hyderabad"
        )
        orchestration = res["orchestration"]
        # Risk level should be high/critical and complexity moderate/complex
        self.assertIn(orchestration["risk_level"], ["HIGH", "CRITICAL"])
        self.assertIn(orchestration["complexity"], ["MODERATE", "COMPLEX"])
        self.assertTrue(orchestration["validation_used"])
        self.assertIsNotNone(orchestration["validation_model"])
        print(f"[PASS] Test P: High-risk complex query invoked secondary validation ({orchestration['validation_model']}).")

    async def test_q_emergency_with_conflicting_model_output(self):
        """TEST Q: Emergency with conflicting model output -> Official warning/evidence remains authoritative."""
        weather_evidence = {"current": {"temperature": 26, "rainfall_mm": 120.0}}
        emergency_evidence = {
            "is_emergency_active": True,
            "warning": {
                "severity": "CRITICAL FLASH FLOOD",
                "instructions": "Evacuate low-lying river areas immediately. Do not attempt road transit."
            }
        }
        # Model attempts to hallucinate that everything is safe
        hallucinated_text = "The weather is totally fine to travel, proceed with travel safely, no danger."
        resolved_text, disagreement, note = DisagreementResolver.resolve(
            primary_text=hallucinated_text,
            validator_text="CONTRADICTION: Active flash flood emergency in place!",
            weather_evidence=weather_evidence,
            emergency_evidence=emergency_evidence,
            place="Hyderabad"
        )
        self.assertTrue(disagreement)
        self.assertIn("OFFICIAL DISASTER DIRECTIVE", resolved_text)
        self.assertIn("Evacuate low-lying river areas", resolved_text)
        print("[PASS] Test Q: Official disaster directive overrode model downplay.")

    async def test_r_routing_stability(self):
        """TEST R: Routing stability -> Same task + same capabilities produce stable routing."""
        task_ctx = TaskContext(
            task_type="WEATHER",
            risk_level="LOW",
            complexity="SIMPLE",
            requires_weather=True,
            requires_rag=False,
            requires_emergency=False,
            primary_intent="GENERAL_WEATHER"
        )
        routes = [ModelRouter.select_route(task_ctx)[0:2] for _ in range(10)]
        first_route = routes[0]
        self.assertTrue(all(r == first_route for r in routes))
        print(f"[PASS] Test R: 10/10 consecutive executions produced stable route: {first_route}.")


if __name__ == "__main__":
    unittest.main()
