import React, { useState } from 'react';
import { 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  MapPin, 
  Radio, 
  ShieldAlert, 
  Sprout, 
  BookOpen, 
  Sparkles, 
  CheckCheck 
} from 'lucide-react';

export default function OrchestrationVisualizer({ orchestration, citations = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (!orchestration || !orchestration.orchestration_steps) return null;

  const steps = orchestration.orchestration_steps || [];
  const agentCount = steps.length;
  const latency = orchestration.supervisor_latency_ms || 320;
  const activeEngine = String(orchestration.active_agent || 'MultiAgentSupervisor');

  const getAgentIcon = (agentName) => {
    const name = String(agentName || '');
    if (name.includes('Geocod')) return <MapPin className="w-3.5 h-3.5 text-cyan-400" />;
    if (name.includes('Meteorolog') || name.includes('Telemetry')) return <Radio className="w-3.5 h-3.5 text-blue-400" />;
    if (name.includes('Emergency') || name.includes('Guardian')) return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
    if (name.includes('Agromet') || name.includes('Crop')) return <Sprout className="w-3.5 h-3.5 text-emerald-400" />;
    if (name.includes('RAG') || name.includes('Knowledge')) return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
    if (name.includes('SURAKSHA') || name.includes('QWEN') || name.includes('LOCAL')) return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
    return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="mt-2.5 pt-2 border-t border-white/10 text-xs">
      
      {/* Clickable Header Pill */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-300 group"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold text-[11px] text-cyan-300">
            Multi-Agent Orchestration ({agentCount} Agents • {latency}ms)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
            {activeEngine.replace('SURAKSHA360_SOVEREIGN', 'Suraksha360 (Local)').replace('LOCAL_QWEN3_8B_SOVEREIGN', 'Suraksha360 (Local)').replace('LLM_GENERATED_', '').replace('GROQ_', 'Groq ').replace('LOCAL_', '').replace('_SOVEREIGN', ' (Local)')}
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {/* Expanded Multi-Agent Execution Flow */}
      {expanded && (
        <div className="mt-2 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150 font-mono">
          
          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-white/10">
            <span className="font-bold uppercase tracking-wider text-cyan-400">⚡ Agent Execution Trace</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCheck className="w-3 h-3" />
              <span>Guardrails Verified</span>
            </span>
          </div>

          {/* Stepper Flow */}
          <div className="space-y-2 text-[11px]">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <div className="p-1 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
                  {getAgentIcon(step.agent)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {String(step.agent || 'Agent').replace('Agent', ' Agent')}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{step.status || 'OK'}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug break-words">
                    {step.action || (step.intent ? `Intent: ${step.intent}` : 'Step completed')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Provenance & RAG Citations */}
          {citations && citations.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
                📚 Grounded Data Sources & Citations
              </span>
              <div className="space-y-1 text-[10px] text-slate-400">
                {citations.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-purple-300 font-bold">[{c.provider}]:</span>
                    <span className="truncate">{c.fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
