import React from 'react';
import WebGISMap from '../map/WebGISMap';
import { ArrowLeft } from 'lucide-react';

export default function MobileMapView({
  latitude,
  longitude,
  district,
  isEmergencyMode,
  emergencyResources,
  onBack
}) {
  return (
    <div className="relative w-full h-full min-h-[85vh] flex flex-col bg-[#080C14]">
      {/* Mobile Map Header Bar */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#080C14]/90 backdrop-blur-md border border-white/15 text-white shadow-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-[#080C14]/90 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>📍 {district} Mobile GIS</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full">
        <WebGISMap
          latitude={latitude}
          longitude={longitude}
          district={district}
          isEmergencyMode={isEmergencyMode}
          emergencyResources={emergencyResources}
          onCloseMap={onBack}
        />
      </div>
    </div>
  );
}
