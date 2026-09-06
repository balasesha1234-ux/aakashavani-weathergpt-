import React, { useState } from 'react';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  ExternalLink, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Car, 
  Footprints, 
  CornerUpRight, 
  CornerUpLeft, 
  Compass, 
  Flag,
  Mountain,
  AlertTriangle
} from 'lucide-react';

export default function EvacuationDirectionsCard({
  route,
  onClearRoute,
  onRecalculate
}) {
  const [showSteps, setShowSteps] = useState(false);

  if (!route) return null;

  const renderStepIcon = (type) => {
    switch (type) {
      case 'right':
        return <CornerUpRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
      case 'left':
        return <CornerUpLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
      case 'arrive':
        return <Flag className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'depart':
        return <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="absolute top-16 right-4 z-[1000] w-full max-w-sm sm:max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="glass-panel p-4 rounded-3xl border border-cyan-500/30 shadow-2xl backdrop-blur-2xl bg-[#080C14]/95 text-white flex flex-col gap-3">
        
        {/* Header with Pulsing Emergency Beacon */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block font-mono">
                LIVE EVACUATION ROUTE ACTIVE
              </span>
              <h3 className="font-extrabold text-sm text-white leading-tight">
                {route.destinationName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClearRoute}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear Directions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Address and Safety Guarantee */}
        <div className="text-xs text-slate-300 flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{route.destinationAddress}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5 text-cyan-400" /> Distance
            </span>
            <span className="font-mono font-extrabold text-sm text-cyan-300 mt-0.5">
              {route.distanceKm} km
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/10 px-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Car className="w-2.5 h-2.5 text-emerald-400" /> Drive ETA
            </span>
            <span className="font-mono font-extrabold text-sm text-emerald-300 mt-0.5">
              ~{route.driveTimeMin} mins
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Footprints className="w-2.5 h-2.5 text-amber-400" /> Walk ETA
            </span>
            <span className="font-mono font-extrabold text-sm text-amber-300 mt-0.5">
              ~{route.walkTimeMin} mins
            </span>
          </div>
        </div>

        {/* Safe Elevation & Flood Avoidance Badge */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>High-Ground Safe Route</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 font-bold">
            {route.safeElevationDelta || "+28m MSL"}
          </span>
        </div>

        {/* Turn-by-Turn Maneuvers Accordion */}
        {route.steps && route.steps.length > 0 && (
          <div className="border-t border-white/10 pt-2">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Turn-by-Turn Navigation ({route.steps.length} Steps)</span>
              </span>
              {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSteps && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {route.steps.map((step, idx) => (
                  <div 
                    key={step.id || idx}
                    className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-colors"
                  >
                    {renderStepIcon(step.type)}
                    <div className="flex-1 leading-snug text-slate-200">
                      <span>{step.instruction}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {/* External Google Maps Hand-off */}
          <a
            href={route.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Voice GPS</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </a>

          {/* Call Relief Helpline */}
          {route.contact && (
            <a
              href={`tel:${route.contact.split('/')[0].trim()}`}
              className="py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
              title="Call Emergency Facility"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
