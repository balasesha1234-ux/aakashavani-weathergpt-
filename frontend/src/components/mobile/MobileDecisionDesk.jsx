import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Sprout, 
  Sailboat, 
  Building2, 
  ChevronRight, 
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';

export default function MobileDecisionDesk({ onBack, onOpenRationale }) {
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);

  const actions = [
    {
      id: 'public',
      role: 'Public',
      icon: Users,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
      action: 'Avoid unnecessary travel. Avoid low-lying roads and waterlogged underpasses.',
      details: 'Keep emergency battery backups charged. Store 3 days of potable water.'
    },
    {
      id: 'farmers',
      role: 'Farmers',
      icon: Sprout,
      color: 'text-lime-600 bg-lime-50 dark:bg-lime-950/40',
      action: 'Delay irrigation. Protect standing cotton & soybean crops from root waterlogging.',
      details: 'Clear field drainage trenches immediately. Suspend pesticide spraying for 48h.'
    },
    {
      id: 'fishermen',
      role: 'Fishermen',
      icon: Sailboat,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
      action: 'Do not venture into the sea. High waves and strong squalls (45-55 km/h) expected.',
      details: 'All mechanized and country craft vessels must return to designated fishing harbours.'
    },
    {
      id: 'admin',
      role: 'District Admin',
      icon: Building2,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
      action: 'Activate temporary shelters. Keep SDRF relief teams and mobile dewatering pumps on standby.',
      details: 'Issue public broadcast sirens and coordinate with CWC gauge stations.'
    }
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-white p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Decision Desk</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Actionable recommendations for everyone</p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Overall Risk Level Card with SVG Semi-Circle Speedometer */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Overall Risk Level
          </span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 tracking-tight">
            HIGH
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-district heavy rain threshold reached</p>
        </div>

        {/* Semi-circle Gauge */}
        <div className="w-28 h-16 relative flex items-end justify-center">
          <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
            {/* Background Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Colored Segment Green */}
            <path
              d="M 10 50 A 40 40 0 0 1 30 20"
              fill="none"
              stroke="#10B981"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Colored Segment Amber */}
            <path
              d="M 30 20 A 40 40 0 0 1 70 20"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="10"
            />
            {/* Colored Segment Red */}
            <path
              d="M 70 20 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#EF4444"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Needle pointing to High (around 75 degrees) */}
            <line
              x1="50"
              y1="50"
              x2="78"
              y2="25"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="5" fill="#0F172A" />
          </svg>
        </div>
      </div>

      {/* Recommended Actions Segmented by Stakeholder */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Recommended Actions
        </span>

        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = selectedStakeholder === act.id;
          return (
            <div
              key={act.id}
              onClick={() => setSelectedStakeholder(isSelected ? null : act.id)}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-sm transition-all cursor-pointer hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${act.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{act.role}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {act.action}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 mt-1 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl">
                  <strong className="text-slate-700 dark:text-slate-200 block mb-1">Detailed Protocol:</strong>
                  {act.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* "Why This Decision?" Card */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-800/40">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Why This Decision?</span>
        </div>
        <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 mt-1.5 leading-relaxed">
          Continuous heavy rainfall and rising river levels indicate a high probability of flooding in low-lying and urban areas.
        </p>

        {onOpenRationale && (
          <button
            onClick={onOpenRationale}
            className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View Full Rationale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
