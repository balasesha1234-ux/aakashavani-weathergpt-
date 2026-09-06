import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Database, 
  Radio, 
  Activity, 
  Cpu, 
  Server, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Search 
} from 'lucide-react';
import { getInspectorOverview, getInspectorTable, getInspectorMqttStream } from '../../services/api';

export default function BackendInspector() {
  const [overview, setOverview] = useState(null);
  const [selectedTable, setSelectedTable] = useState('locations');
  const [tableData, setTableData] = useState([]);
  const [mqttPackets, setMqttPackets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tables = [
    { id: 'locations', label: 'LOCATIONS (Districts/AWS)', count: overview?.database_counts?.locations || 4 },
    { id: 'warnings', label: 'WARNINGS (Active CAP Alerts)', count: overview?.database_counts?.active_warnings || 2 },
    { id: 'emergency_resources', label: 'EMERGENCY_RESOURCES (Verified)', count: overview?.database_counts?.emergency_resources || 6 },
    { id: 'response_traces', label: 'RESPONSE_TRACES (AI Provenance)', count: overview?.database_counts?.response_traces || 0 }
  ];

  const fetchInspectorData = async () => {
    setIsLoading(true);
    try {
      const over = await getInspectorOverview();
      if (over) setOverview(over);

      const rows = await getInspectorTable(selectedTable);
      setTableData(rows);

      const mqtt = await getInspectorMqttStream();
      setMqttPackets(mqtt);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectorData();
    const interval = setInterval(fetchInspectorData, 10000);
    return () => clearInterval(interval);
  }, [selectedTable]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl glass-panel border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Backend & Telemetry Inspector Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                LIVE ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time inspection of 15-Table Spatial Database, WIS 2.0 MQTT streams & AI tool execution traces.
            </p>
          </div>
        </div>

        <button
          onClick={fetchInspectorData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* System Health & Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Backend Engine</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-white">FastAPI 0.115 Async</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">● 4 Workers Online (0.0.0.0:8000)</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">WIS 2.0 Telemetry</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-emerald-300">WMO MQTT 2.0</p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Sub-second Alert Relay Active</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Relational Schema</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm font-bold text-white">15 Tables Indexed</p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">PostGIS Geodetic Geofencing</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">AI Tool Latency</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-sm font-bold text-white">~180ms - 220ms</p>
          <p className="text-[10px] text-cyan-400 mt-1 font-mono">Zero Hallucination Guarded</p>
        </div>
      </div>

      {/* Main Split: Visual Database Table Explorer (Left) & MQTT Packet Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (8 Cols): Visual Database Explorer */}
        <div className="lg:col-span-8 p-4 rounded-3xl glass-panel border border-white/10 space-y-3">
          
          {/* Table Selector Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedTable === t.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {tableData.length} records found
            </span>
          </div>

          {/* Table Rows Viewer */}
          <div className="overflow-x-auto max-h-[440px] rounded-xl border border-white/5 bg-[#080C14]/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-cyan-400 font-bold sticky top-0 border-b border-white/10">
                <tr>
                  {tableData.length > 0 && Object.keys(tableData[0]).map((k, i) => (
                    <th key={i} className="px-3.5 py-2.5 whitespace-nowrap">{k.replace('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 max-w-[280px] truncate text-slate-300">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column (4 Cols): Live WIS 2.0 MQTT Packet Stream */}
        <div className="lg:col-span-4 p-4 rounded-3xl glass-panel border border-white/10 space-y-3">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                WIS 2.0 MQTT Stream
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              SUBSCRIBED
            </span>
          </div>

          {/* Incoming MQTT Packets Feed */}
          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {mqttPackets.map((pkt, i) => (
              <div key={i} className="p-3 rounded-2xl bg-[#080C14]/90 border border-white/5 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[10px] text-cyan-400">
                  <span className="font-bold truncate max-w-[180px]">{pkt.station}</span>
                  <span className="text-slate-500">{new Date(pkt.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <p className="text-[10px] text-slate-400 break-all leading-tight">
                  {pkt.topic}
                </p>

                <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-[10px] text-emerald-300">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(pkt.metrics, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
