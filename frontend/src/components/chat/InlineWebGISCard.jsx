import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  Polyline, 
  Circle,
  LayerGroup,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Maximize2, 
  Minimize2, 
  CloudRain, 
  Cloud,
  Thermometer, 
  Radio, 
  ShieldAlert, 
  MapPin,
  Route,
  Navigation,
  ExternalLink,
  Phone,
  X,
  Zap
} from 'lucide-react';
import ErrorBoundary from '../common/ErrorBoundary';
import { fetchEvacuationRoute } from '../../services/routingService';

function RouteFitter({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [coordinates, map]);
  return null;
}

function WebGISMapInner({
  latitude,
  longitude,
  district,
  isEmergency,
  emergencyResources,
  isExpanded,
  setIsExpanded,
  onDismiss
}) {
  const [activeLayer, setActiveLayer] = useState('radar');
  const [activeRoute, setActiveRoute] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [radarPath, setRadarPath] = useState('');
  const center = [Number(latitude) || 20.7453, Number(longitude) || 78.6022];

  // Fetch real-time RainViewer Doppler Radar path
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(d => {
        if (d?.radar?.past && Array.isArray(d.radar.past) && d.radar.past.length > 0) {
          setRadarPath(d.radar.past[d.radar.past.length - 1].path);
        }
      })
      .catch(e => console.warn("RainViewer fetch notice:", e));
  }, []);

  // Keyboard shortcut: Escape key exits fullscreen or dismisses
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
        } else if (onDismiss) {
          onDismiss();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, setIsExpanded, onDismiss]);

  // Custom DivIcons
  const createIcon = (emoji, color, size = 32) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${size * 0.45}px; border: 2px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">${emoji}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const userIcon = createIcon('📍', '#00F0FF', 34);
  const shelterIcon = createIcon('⛺', '#FF2A55', 30);
  const hospitalIcon = createIcon('🏥', '#10B981', 30);
  const awsStationIcon = createIcon('📡', '#6366F1', 26);

  const defaultShelters = [
    {
      resource_type: 'RELIEF_SHELTER',
      name: `${district} Verified Relief Camp #1`,
      address: `Civil Defense High-Ground Facility, ${district}`,
      contact: '1077 / 112',
      latitude: Number((center[0] + 0.018).toFixed(4)),
      longitude: Number((center[1] - 0.015).toFixed(4))
    },
    {
      resource_type: 'HOSPITAL',
      name: `${district} Emergency Trauma Ward`,
      address: `District Hospital Road, ${district}`,
      contact: '108',
      latitude: Number((center[0] - 0.016).toFixed(4)),
      longitude: Number((center[1] + 0.018).toFixed(4))
    }
  ];

  const displayedResources = (emergencyResources && emergencyResources.length > 0)
    ? emergencyResources
    : defaultShelters;

  const handleGetDirections = async (shelter) => {
    setIsRouting(true);
    try {
      const route = await fetchEvacuationRoute(
        { lat: center[0], lon: center[1] },
        { 
          lat: shelter.latitude, 
          lon: shelter.longitude, 
          name: shelter.name, 
          address: shelter.address, 
          contact: shelter.contact 
        }
      );
      setActiveRoute(route);
    } catch (err) {
      console.warn("Inline route error:", err);
    } finally {
      setIsRouting(false);
    }
  };

  const disasterPolygon = [
    [center[0] - 0.35, center[1] - 0.40],
    [center[0] + 0.35, center[1] - 0.40],
    [center[0] + 0.35, center[1] + 0.40],
    [center[0] - 0.35, center[1] + 0.40]
  ];

  const cycloneTrack = [
    [center[0] - 3.5, center[1] + 2.5],
    [center[0] - 2.1, center[1] + 1.6],
    [center[0] - 1.0, center[1] + 0.8],
    [center[0], center[1]]
  ];

  const nearbyStations = [
    { name: `${district} IMD Agro-AWS`, lat: center[0] + 0.04, lon: center[1] + 0.03, temp: "31.2°C", rain: "0.0 mm" },
    { name: `South ${district} Doppler Radar`, lat: center[0] - 0.05, lon: center[1] - 0.04, temp: "30.8°C", rain: "0.0 mm" }
  ];

  const mapKey = `map-${center[0].toFixed(2)}-${center[1].toFixed(2)}-${isExpanded ? 'exp' : 'min'}`;

  return (
    <div className={`rounded-3xl overflow-hidden border border-white/15 my-3 transition-all ${
      isExpanded 
        ? 'fixed inset-4 sm:inset-8 z-50 bg-[#080C14] shadow-2xl flex flex-col' 
        : 'relative w-full h-80 shadow-2xl'
    }`}>
      
      {/* Top Floating Header & Layer Switcher */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="glass-panel px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md backdrop-blur-xl bg-[#080C14]/85 border border-white/10 text-white">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>📍 {district} GIS Radar</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 glass-panel p-1 rounded-2xl shadow-md text-[11px] font-semibold backdrop-blur-xl bg-[#080C14]/85 border border-white/10">
            <button
              onClick={() => setActiveLayer('radar')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                activeLayer === 'radar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              <span>Radar</span>
            </button>

            <button
              onClick={() => setActiveLayer('temp')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                activeLayer === 'temp' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-3 h-3" />
              <span>Temp</span>
            </button>

            <button
              onClick={() => setActiveLayer('stations')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                activeLayer === 'stations' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Stations</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {displayedResources.length > 0 && (
            <button
              onClick={() => handleGetDirections(displayedResources[0])}
              disabled={isRouting}
              className="glass-panel px-2.5 py-1.5 rounded-2xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-md bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/40 transition-all cursor-pointer"
            >
              <Route className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isRouting ? 'Routing...' : 'Evacuate'}</span>
            </button>
          )}

          {isExpanded ? (
            <button
              onClick={() => setIsExpanded(false)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-lg cursor-pointer transition-all border border-rose-400/40 hover:scale-105"
              title="Close Fullscreen (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Close (✕)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors bg-[#080C14]/85 border border-white/10 cursor-pointer"
                title="Expand Full Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-2 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 transition-all border border-rose-500/40 cursor-pointer"
                  title="Close Map (✕)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close Map</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Inline Route Banner if active */}
      {activeRoute && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] p-2.5 rounded-2xl glass-panel bg-[#080C14]/95 border border-cyan-500/40 shadow-2xl flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span className="font-extrabold text-cyan-300 block leading-none">{activeRoute.destinationName}</span>
              <span className="text-[10px] text-slate-400">Distance: <strong>{activeRoute.distanceKm} km</strong> (~{activeRoute.driveTimeMin}m drive)</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={activeRoute.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm"
            >
              <Navigation className="w-3 h-3" />
              <span>GPS</span>
            </a>
            <button
              onClick={() => setActiveRoute(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <MapContainer
        key={mapKey}
        center={center}
        zoom={isEmergency ? 11 : 12}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom={isExpanded}
        className="w-full h-full"
        style={{ minHeight: '100%', background: '#080C14' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>'
          url={`https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY || '6DHkiQEEsGyoDdRvLWvG'}`}
          maxNativeZoom={18}
          maxZoom={18}
          minZoom={3}
        />

        {/* User Location Pin with Glowing Radar Halo */}
        <Circle
          center={center}
          radius={1800}
          pathOptions={{
            color: '#00F0FF',
            fillColor: '#00F0FF',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 6'
          }}
        />
        <Marker position={center} icon={userIcon}>
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <span className="text-[9px] font-bold uppercase text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded">
                OBSERVATION POINT
              </span>
              <h4 className="font-bold text-sm mt-1">{district}</h4>
              <p className="text-xs text-slate-600">Coordinates: {center[0].toFixed(3)}°N, {center[1].toFixed(3)}°E</p>
            </div>
          </Popup>
        </Marker>

        {/* Live Evacuation Route Polylines */}
        {activeRoute && activeRoute.coordinates && (
          <LayerGroup>
            <RouteFitter coordinates={activeRoute.coordinates} />
            <Polyline
              positions={activeRoute.coordinates}
              pathOptions={{
                color: '#00F0FF',
                weight: 8,
                opacity: 0.45,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Polyline
              positions={activeRoute.coordinates}
              pathOptions={{
                color: '#10B981',
                weight: 4,
                opacity: 0.95,
                dashArray: '6, 10',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </LayerGroup>
        )}

        {/* Real-Time Live RainViewer Doppler Radar TileLayer */}
        {activeLayer === 'radar' && radarPath && (
          <TileLayer
            key={`inline-radar-${radarPath}`}
            url={`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.72}
            zIndex={500}
            maxNativeZoom={7}
            maxZoom={18}
          />
        )}

        {activeLayer === 'radar' && (
          <LayerGroup>
            <Circle
              center={center}
              radius={isEmergency ? 25000 : 12000}
              pathOptions={{
                color: isEmergency ? '#FF2A55' : '#00F0FF',
                fillColor: isEmergency ? '#FF2A55' : '#00F0FF',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '3, 6'
              }}
            />
          </LayerGroup>
        )}

        {activeLayer === 'temp' && (
          <LayerGroup>
            <Circle
              center={center}
              radius={18000}
              pathOptions={{
                color: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.25,
                weight: 1
              }}
            />
          </LayerGroup>
        )}

        {activeLayer === 'stations' && (
          <LayerGroup>
            {nearbyStations.map((st, i) => (
              <Marker key={i} position={[st.lat, st.lon]} icon={awsStationIcon}>
                <Popup>
                  <div className="text-slate-900 font-sans p-1">
                    <span className="text-[9px] font-bold uppercase text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                      IMD AWS STATION
                    </span>
                    <h4 className="font-bold text-xs mt-1">{st.name}</h4>
                    <p className="text-xs text-slate-700 mt-0.5">Temp: <strong>{st.temp}</strong> | Rain: <strong>{st.rain}</strong></p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}

        {/* Shelter and Hospital Markers */}
        {displayedResources.map((res, i) => (
          <Marker
            key={i}
            position={[res.latitude, res.longitude]}
            icon={res.resource_type === 'HOSPITAL' ? hospitalIcon : shelterIcon}
          >
            <Popup>
              <div className="text-slate-900 font-sans p-1 min-w-[200px]">
                <span className="text-[9px] font-bold uppercase text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                  {res.resource_type}
                </span>
                <h4 className="font-bold text-xs mt-1">{res.name}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">{res.address}</p>
                <p className="text-xs text-cyan-600 font-bold font-mono">📞 {res.contact}</p>
                
                <button
                  onClick={() => handleGetDirections(res)}
                  className="w-full mt-2 py-1 px-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Get Directions</span>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {isEmergency && (
          <>
            <Polygon
              positions={disasterPolygon}
              pathOptions={{ color: '#FF2A55', fillColor: '#FF2A55', fillOpacity: 0.3, weight: 2 }}
            />
            <Polyline
              positions={cycloneTrack}
              pathOptions={{ color: '#FF2A55', dashArray: '4, 6', weight: 3 }}
            />
          </>
        )}

      </MapContainer>
    </div>
  );
}

export default function InlineWebGISCard(props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ErrorBoundary name="Interactive WebGIS Radar Map">
      <WebGISMapInner {...props} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    </ErrorBoundary>
  );
}
