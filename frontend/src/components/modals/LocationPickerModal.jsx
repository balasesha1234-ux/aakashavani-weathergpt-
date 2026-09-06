import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  LocateFixed, 
  Loader2, 
  Check, 
  Navigation,
  Compass,
  Building2,
  Sparkles
} from 'lucide-react';
import { searchLocation, detectDeviceLocation } from '../../services/location';

export default function LocationPickerModal({
  isOpen,
  onClose,
  currentDistrict,
  currentLat,
  currentLon,
  onSelectLocation
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Popular Indian Major Cities & Farming / Coastal Hubs
  const popularHubs = [
    { name: "Hyderabad", district: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, type: "Capital Metro" },
    { name: "Bengaluru", district: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, type: "Tech Hub" },
    { name: "Mumbai", district: "Mumbai", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777, type: "Coastal Metro" },
    { name: "Delhi NCR", district: "New Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.2090, type: "National Capital" },
    { name: "Chennai", district: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, type: "Coastal Metro" },
    { name: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185, type: "Marine Port" },
    { name: "Vijayawada", district: "Vijayawada", state: "Andhra Pradesh", latitude: 16.5062, longitude: 80.6480, type: "Krishna Basin" },
    { name: "Warangal", district: "Warangal", state: "Telangana", latitude: 17.9689, longitude: 79.5941, type: "Agro Hub" },
    { name: "Pune", district: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, type: "Western Hub" },
    { name: "Wardha", district: "Wardha", state: "Maharashtra", latitude: 20.7453, longitude: 78.6022, type: "Cotton Belt" },
    { name: "Puri", district: "Puri", state: "Odisha", latitude: 19.8135, longitude: 85.8312, type: "Cyclone Coastal" },
    { name: "Jaipur", district: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, type: "Arid Zone" }
  ];

  // Debounced Search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const res = await searchLocation(query);
      setResults(res);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Handle GPS Auto-detect
  const handleGPSClick = async () => {
    setIsDetectingGPS(true);
    setGpsError('');
    try {
      const loc = await detectDeviceLocation();
      onSelectLocation({
        district: loc.district || "Detected Location",
        latitude: loc.latitude,
        longitude: loc.longitude,
        state: loc.state || "India",
        isGPS: true
      });
      onClose();
    } catch (err) {
      setGpsError('Unable to detect high-accuracy GPS. Please pick or search your city manually.');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#080C14] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Select Your Location</h3>
              <p className="text-[11px] text-slate-400">Weather, Radar & Alerts calibrate to your selected district</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Pill */}
        <div className="px-4 py-2.5 bg-cyan-500/5 border-b border-cyan-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Active:</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              {currentDistrict || "Unknown"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({currentLat?.toFixed(2)}°, {currentLon?.toFixed(2)}°)
            </span>
          </div>

          <button
            onClick={handleGPSClick}
            disabled={isDetectingGPS}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition cursor-pointer"
          >
            {isDetectingGPS ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-cyan-300" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <LocateFixed className="w-3 h-3 text-cyan-400" />
                <span>Auto-Detect GPS</span>
              </>
            )}
          </button>
        </div>

        {gpsError && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{gpsError}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any Indian city, district, village (e.g. Bangalore, Warangal, Mumbai)..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:outline-none text-white text-xs placeholder:text-slate-500 shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Results or Preset Hubs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Live Search Results */}
          {query.trim().length >= 2 ? (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Search Results</span>
                {isSearching && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
              </div>

              {results.length === 0 && !isSearching ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <Navigation className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p>No locations found matching "{query}". Try a broader city or district name.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {results.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectLocation({
                          district: r.district,
                          latitude: r.latitude,
                          longitude: r.longitude,
                          state: r.state
                        });
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {r.name}
                          </span>
                          <p className="text-[11px] text-slate-400">
                            {r.state}{r.country && r.country !== 'India' ? `, ${r.country}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Popular Hubs Grid */
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Popular Cities & Regional Hubs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {popularHubs.map((hub, idx) => {
                  const isCurrent = currentDistrict?.toLowerCase().includes(hub.name.toLowerCase());

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectLocation({
                          district: hub.district,
                          latitude: hub.latitude,
                          longitude: hub.longitude,
                          state: hub.state
                        });
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/30'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 border-white/5 hover:border-cyan-500/30 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{hub.name}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{hub.state}</span>
                        <span className="font-mono text-[9px] text-cyan-400/80">{hub.type}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-500">
          <span>Supported by Open-Meteo High-Resolution Geocoding</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
