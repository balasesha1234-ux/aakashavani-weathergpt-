"""
AakashaVani: Phase 4 Multi-Model Intelligence Ecosystem
Centralized capability registry, model descriptors, selective validation,
and evidence-based disagreement resolution.
"""

import os
import re
import time
import asyncio
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List, Set, Tuple

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


class ModelCapability:
    # Domain capabilities
    GENERAL_CONVERSATION = "general_conversation"
    EDUCATION = "education"
    WEATHER = "weather"
    FORECAST = "forecast"
    SAFETY_RISK = "safety_risk"
    DISASTER = "disaster"
    EMERGENCY = "emergency"
    EMERGENCY_REASONING = "emergency_reasoning"
    COMPLEX_REASONING = "complex_reasoning"
    REASONING = "reasoning"

    # Context & reasoning depth
    LONG_CONTEXT = "long_context"
    VALIDATOR = "validator"

    # Multilingual capabilities
    MULTILINGUAL = "multilingual"
    TELUGU = "telugu"
    HINGLISH = "hinglish"
    HINDI = "hindi"
    MARATHI = "marathi"
    ENGLISH = "english"

    # Operational & deployment attributes
    LOW_LATENCY = "low_latency"
    LOW_COST = "low_cost"
    LOCAL = "local"
    CLOUD = "cloud"


@dataclass
class ModelDescriptor:
    model_id: str
    role: str
    provider_name: str
    model_name: str
    capabilities: Set[str] = field(default_factory=set)
    priority: int = 100
    cost_class: str = "free"      # "free", "low", "medium", "high"
    latency_class: str = "low"    # "ultra_low", "low", "medium", "high"
    is_local: bool = False
    is_cloud: bool = True
    is_enabled: bool = True
    description: str = ""

    def has_capabilities(self, required: Set[str]) -> bool:
        return required.issubset(self.capabilities)


class ModelRegistry:
    """
    Centralized Model Registry for AakashaVani (Phase 4).
    Maintains available model configurations, tracks operational capabilities,
    and supports dynamic role assignments via environment variables.
    """
    def __init__(self):
        self._models: Dict[str, ModelDescriptor] = {}
        self._providers: Dict[str, Any] = {}
        self._initialize_from_env()

    def _initialize_from_env(self):
        """Register canonical architectural roles and configured providers."""
        # 1. SURAKSHA360: Sovereign On-Device LLM (NVIDIA RTX 5050 Laptop GPU, 8GB VRAM)
        local_provider = os.getenv("MODEL_SURAKSHA360_PROVIDER", os.getenv("MODEL_LOCAL_QWEN_PROVIDER", "local_ollama"))
        local_model = os.getenv("MODEL_SURAKSHA360_NAME", os.getenv("MODEL_LOCAL_QWEN_NAME", os.getenv("OLLAMA_MODEL", "suraksha360")))
        suraksha_desc = ModelDescriptor(
            model_id="suraksha360",
            role="SURAKSHA360",
            provider_name=local_provider,
            model_name=local_model,
            capabilities={
                ModelCapability.GENERAL_CONVERSATION,
                ModelCapability.EDUCATION,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.HINDI,
                ModelCapability.MARATHI,
                ModelCapability.ENGLISH,
                ModelCapability.LOW_COST,
                ModelCapability.LOCAL,
                ModelCapability.VALIDATOR
            },
            priority=150,
            cost_class="free",
            latency_class="low",
            is_local=True,
            is_cloud=False,
            description="Suraksha360: Sovereign on-device LLM in 8GB VRAM on NVIDIA RTX 5050"
        )
        self.register_model(suraksha_desc)
        # Backward compatibility alias
        self._models["local_qwen"] = suraksha_desc

        # 2. WEATHER_SPECIALIST: Grounded Meteorological & Forecast Cloud Model
        weather_provider = os.getenv("MODEL_WEATHER_PROVIDER", "groq")
        weather_model = os.getenv("MODEL_WEATHER_NAME", os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"))
        self.register_model(ModelDescriptor(
            model_id="weather_specialist",
            role="WEATHER_SPECIALIST",
            provider_name=weather_provider,
            model_name=weather_model,
            capabilities={
                ModelCapability.WEATHER,
                ModelCapability.FORECAST,
                ModelCapability.REASONING,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.HINDI,
                ModelCapability.ENGLISH,
                ModelCapability.LOW_LATENCY,
                ModelCapability.CLOUD,
                ModelCapability.VALIDATOR
            },
            priority=140,
            cost_class="low",
            latency_class="ultra_low",
            is_local=False,
            is_cloud=True,
            description="High-throughput cloud specialist for NWP weather synthesis"
        ))

        # 3. SAFETY_SPECIALIST: Critical Safety & Disaster Advisory Model
        safety_provider = os.getenv("MODEL_SAFETY_PROVIDER", "groq")
        safety_model = os.getenv("MODEL_SAFETY_NAME", os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"))
        self.register_model(ModelDescriptor(
            model_id="safety_specialist",
            role="SAFETY_SPECIALIST",
            provider_name=safety_provider,
            model_name=safety_model,
            capabilities={
                ModelCapability.SAFETY_RISK,
                ModelCapability.DISASTER,
                ModelCapability.EMERGENCY,
                ModelCapability.EMERGENCY_REASONING,
                ModelCapability.REASONING,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.ENGLISH,
                ModelCapability.LOW_LATENCY,
                ModelCapability.CLOUD,
                ModelCapability.VALIDATOR
            },
            priority=135,
            cost_class="low",
            latency_class="ultra_low",
            is_local=False,
            is_cloud=True,
            description="Specialist cloud model enforcing CAP safety directives"
        ))

        # 4. REASONING_CLOUD: Complex Conditional Decision Specialist
        reasoning_provider = os.getenv("MODEL_REASONING_PROVIDER", "groq")
        reasoning_model = os.getenv("MODEL_REASONING_NAME", os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"))
        self.register_model(ModelDescriptor(
            model_id="reasoning_cloud",
            role="REASONING_CLOUD",
            provider_name=reasoning_provider,
            model_name=reasoning_model,
            capabilities={
                ModelCapability.COMPLEX_REASONING,
                ModelCapability.REASONING,
                ModelCapability.LONG_CONTEXT,
                ModelCapability.SAFETY_RISK,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.ENGLISH,
                ModelCapability.CLOUD,
                ModelCapability.VALIDATOR
            },
            priority=130,
            cost_class="low",
            latency_class="ultra_low",
            is_local=False,
            is_cloud=True,
            description="Specialist model for complex multi-variable conditional logic"
        ))

        # 5. GENERAL_CLOUD: High-Capacity Conversational Cloud Fallback
        general_provider = os.getenv("MODEL_GENERAL_PROVIDER", "groq")
        general_model = os.getenv("MODEL_GENERAL_NAME", os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"))
        self.register_model(ModelDescriptor(
            model_id="general_cloud",
            role="GENERAL_CLOUD",
            provider_name=general_provider,
            model_name=general_model,
            capabilities={
                ModelCapability.GENERAL_CONVERSATION,
                ModelCapability.EDUCATION,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.ENGLISH,
                ModelCapability.LONG_CONTEXT,
                ModelCapability.CLOUD
            },
            priority=110,
            cost_class="low",
            latency_class="ultra_low",
            is_local=False,
            is_cloud=True,
            description="Conversational cloud model for extended dialogues"
        ))

        # 6. Secondary Cloud Providers (Gemini / OpenAI fallbacks)
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.register_model(ModelDescriptor(
            model_id="gemini_fallback",
            role="GENERAL_CLOUD",
            provider_name="gemini",
            model_name=gemini_model,
            capabilities={
                ModelCapability.GENERAL_CONVERSATION,
                ModelCapability.EDUCATION,
                ModelCapability.WEATHER,
                ModelCapability.FORECAST,
                ModelCapability.SAFETY_RISK,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.ENGLISH,
                ModelCapability.LONG_CONTEXT,
                ModelCapability.CLOUD,
                ModelCapability.VALIDATOR
            },
            priority=90,
            cost_class="free",
            latency_class="low",
            is_local=False,
            is_cloud=True,
            description="Google Gemini 1.5 Flash cloud fallback"
        ))

        # 7. Deterministic Safety Fallback Provider (100% uptime baseline)
        self.register_model(ModelDescriptor(
            model_id="deterministic_engine",
            role="DETERMINISTIC_FALLBACK",
            provider_name="deterministic_fallback",
            model_name="rule_engine",
            capabilities={
                ModelCapability.GENERAL_CONVERSATION,
                ModelCapability.EDUCATION,
                ModelCapability.WEATHER,
                ModelCapability.FORECAST,
                ModelCapability.SAFETY_RISK,
                ModelCapability.DISASTER,
                ModelCapability.EMERGENCY,
                ModelCapability.MULTILINGUAL,
                ModelCapability.TELUGU,
                ModelCapability.HINGLISH,
                ModelCapability.ENGLISH,
                ModelCapability.LOCAL,
                ModelCapability.LOW_COST,
                ModelCapability.LOW_LATENCY
            },
            priority=10,
            cost_class="free",
            latency_class="ultra_low",
            is_local=True,
            is_cloud=False,
            description="Authoritative deterministic rule engine ensuring 100% availability"
        ))

    def register_provider(self, name: str, provider_instance: Any):
        self._providers[name] = provider_instance

    def get_provider(self, name: str) -> Optional[Any]:
        return self._providers.get(name)

    def register_model(self, descriptor: ModelDescriptor):
        self._models[descriptor.model_id] = descriptor

    def get_model(self, model_id: str) -> Optional[ModelDescriptor]:
        return self._models.get(model_id)

    def list_models(self) -> List[ModelDescriptor]:
        return list(self._models.values())

    def find_capable_models(
        self,
        required_capabilities: Set[str],
        prefer_local: Optional[bool] = None,
        exclude_providers: Optional[Set[str]] = None,
        language: Optional[str] = None
    ) -> List[ModelDescriptor]:
        """
        Finds and ranks all enabled models supporting required capabilities.
        Ranks by local/cloud preference, priority, and availability.
        """
        exclude_providers = exclude_providers or set()
        matched: List[ModelDescriptor] = []

        for desc in self._models.values():
            if not desc.is_enabled:
                continue
            if desc.provider_name in exclude_providers:
                continue
            if not desc.has_capabilities(required_capabilities):
                continue
            
            # Language capability check
            if language:
                lang_cap = language.lower()
                # If specific language required (like telugu), ensure model supports it
                if lang_cap in [ModelCapability.TELUGU, ModelCapability.HINGLISH, ModelCapability.HINDI, ModelCapability.MARATHI]:
                    if lang_cap not in desc.capabilities and ModelCapability.MULTILINGUAL not in desc.capabilities:
                        continue

            # Check provider availability
            provider = self._providers.get(desc.provider_name)
            if provider is not None and not provider.is_available():
                continue

            matched.append(desc)

        # Ranking heuristic:
        # 1. Local preference match
        # 2. Priority descending
        # 3. Cost & latency
        def _sort_key(m: ModelDescriptor):
            local_score = 1 if (prefer_local is not None and m.is_local == prefer_local) else 0
            return (local_score, m.priority)

        matched.sort(key=_sort_key, reverse=True)
        return matched

    async def health_check_all(self) -> Dict[str, Dict[str, Any]]:
        """Health-checks all registered providers and models."""
        results = {}
        for name, provider in self._providers.items():
            is_avail = provider.is_available()
            status = "HEALTHY" if is_avail else "UNAVAILABLE"
            health_ok = True
            if hasattr(provider, "health_check") and callable(provider.health_check):
                try:
                    health_ok = await provider.health_check()
                    if not health_ok:
                        status = "DEGRADED"
                except Exception as e:
                    status = f"ERROR: {str(e)[:40]}"
            results[name] = {
                "available": is_avail,
                "status": status,
                "model_name": getattr(provider, "DEFAULT_MODEL", "n/a")
            }
        return results


class MultiModelValidator:
    """
    Selective Multi-Model Validation Controller (Phase 4).
    Only triggers for high-risk / complex queries.
    Validates primary model outputs against grounded evidence.
    """
    @classmethod
    def should_validate(cls, risk_level: str, complexity: str) -> bool:
        """Determines if a second validation model should be invoked."""
        enabled = os.getenv("ENABLE_SELECTIVE_VALIDATION", "true").lower() in ["true", "1", "yes"]
        if not enabled:
            return False
        # Strictly for HIGH or CRITICAL risk queries with MODERATE or COMPLEX reasoning
        if risk_level in ["HIGH", "CRITICAL"] and complexity in ["MODERATE", "COMPLEX"]:
            return True
        return False

    @classmethod
    def select_validator(
        cls,
        registry: ModelRegistry,
        primary_model: ModelDescriptor,
        required_caps: Set[str]
    ) -> Optional[ModelDescriptor]:
        """Finds a secondary validator model distinct from the primary model."""
        candidates = registry.find_capable_models(
            required_capabilities={ModelCapability.VALIDATOR}.union(required_caps),
            exclude_providers={primary_model.provider_name}
        )
        if candidates:
            return candidates[0]
        
        # Fallback to local model if primary was cloud, or vice-versa
        all_validators = registry.find_capable_models(
            required_capabilities={ModelCapability.VALIDATOR},
            exclude_providers={primary_model.provider_name}
        )
        return all_validators[0] if all_validators else None


class DisagreementResolver:
    """
    Evaluates conflicting model assertions against authoritative tool evidence.
    Authoritative hierarchy:
    1. Official NDMA/IMD CAP warnings & emergency directives
    2. Ground-truth physical meteorological observations (NWP / radar)
    3. Verified shelter & helpline resources
    4. Model interpretations
    """
    @classmethod
    def resolve(
        cls,
        primary_text: str,
        validator_text: Optional[str],
        weather_evidence: Dict[str, Any],
        emergency_evidence: Dict[str, Any],
        place: str
    ) -> Tuple[str, bool, str]:
        disagreement_detected = False
        resolution_notes = []

        is_emergency_active = bool(emergency_evidence and emergency_evidence.get("is_emergency_active"))
        official_instructions = emergency_evidence.get("warning", {}).get("instructions", "") if is_emergency_active else ""
        official_severity = emergency_evidence.get("warning", {}).get("severity", "") if is_emergency_active else ""

        # 1. EMERGENCY SAFETY INVARIANT
        if is_emergency_active:
            downplay_terms = [
                "safe to travel", "feel free to go", "no danger", "all safe", "weather is fine",
                "proceed with travel", "no need to worry", "safe for travel", "not dangerous"
            ]
            primary_unsafe = any(term in primary_text.lower() for term in downplay_terms)
            validator_warning = False
            if validator_text:
                validator_warning = any(w in validator_text.lower() for w in ["warning", "danger", "do not travel", "stay indoors", "unsafe"])

            if primary_unsafe:
                disagreement_detected = True
                resolution_notes.append("Primary model downplayed active disaster warning.")
                # Authoritative override
                safe_text = (
                    f"⚠️ **OFFICIAL DISASTER DIRECTIVE ({official_severity})**: Active emergency in {place}.\n"
                    f"{official_instructions}\n\n"
                    "For life safety, avoid outdoor travel and follow local administration directives immediately."
                )
                return safe_text, True, "Disaster authority enforced over model downplay."

        # 2. PHYSICAL WEATHER TELEMETRY INVARIANT
        curr_obs = weather_evidence.get("current", {})
        if curr_obs:
            true_temp = curr_obs.get("temperature")
            true_rain = curr_obs.get("rainfall_mm", 0.0)

            # Check if primary fabricated extreme contradictory temperature (> 5°C discrepancy)
            temp_matches = re.findall(r'(\d+)\s*(?:°C|degrees|C\b)', primary_text)
            if temp_matches and true_temp is not None:
                for match in temp_matches:
                    try:
                        stated_temp = int(match)
                        if abs(stated_temp - round(true_temp)) >= 5 and stated_temp not in [24, 7]:  # exclude hours/days
                            disagreement_detected = True
                            resolution_notes.append(f"Primary stated {stated_temp}°C vs telemetry {true_temp}°C.")
                            # Correct the statement
                            primary_text = re.sub(
                                rf'\b{stated_temp}\s*(?:°C|degrees|C)\b',
                                f"{round(true_temp)}°C",
                                primary_text
                            )
                    except ValueError:
                        pass

        # 3. IF VALIDATOR FLAGGED SPECIFIC CONFLICT
        if validator_text and not disagreement_detected:
            val_lower = validator_text.lower()
            if "disagree" in val_lower or "inconsistent" in val_lower or "contradict" in val_lower:
                disagreement_detected = True
                resolution_notes.append("Validator noted interpretation uncertainty; marked response as cautionary.")
                if not primary_text.endswith("."):
                    primary_text += "."
                primary_text += " *(Note: Conditions remain dynamic; please monitor real-time local updates.)*"

        note_str = "; ".join(resolution_notes) if resolution_notes else "Verified consistent with grounded telemetry"
        return primary_text, disagreement_detected, note_str


# Global registry singleton
model_registry = ModelRegistry()
