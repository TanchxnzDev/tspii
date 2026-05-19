"use client";

import { useState, useEffect } from "react";
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
   ReferenceLine, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
   Network, Zap, AlertTriangle, TrendingUp, Search,
   Activity, ChevronRight, Info, Layers, Sparkles,
   Database, Share2, Download, Settings2, RefreshCw,
   Loader2, CheckCircle2, X
} from "lucide-react";
import Link from "next/link";

const DOMAIN_COLOR: Record<string, string> = {
   D1: "#0A5C8E", D2: "#059669", D3: "#D97706", D4: "#6B7280",
   D5: "#DC2626", D6: "#0A5C8E", D7: "#059669", D8: "#D97706",
   D9: "#6B7280", D10: "#DC2626", D11: "#0A5C8E", D12: "#059669",
};

const SYMPTOM_QUICK = [
   { label: "Chronic Fatigue", key: "fatigue" },
   { label: "Insomnia / Sleep Debt", key: "insomnia" },
   { label: "IBS / Bloating", key: "bloating" },
   { label: "Joint Inflammation", key: "joint_pain" },
   { label: "Hypertension", key: "hbp" },
   { label: "High HbA1c", key: "hba1c" },
   { label: "Chronic Stress", key: "stress" },
];

export default function AxisGraphPage() {
   const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [graphData, setGraphData] = useState<any[]>([]);
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);
      generateMockData();
   }, []);

   const generateMockData = () => {
      setIsAnalyzing(true);
      setTimeout(() => {
         const newData = Array.from({ length: 36 }, (_, i) => {
            const axisNum = i + 1;
            const domain = `D${Math.floor(i / 3) + 1}`;
            const baseScore = Math.floor(Math.random() * 40) + 20;
            const boost = Object.values(selectedSymptoms).filter(v => v).length * 8;
            const finalScore = Math.min(100, baseScore + boost + (Math.random() * 15));

            return {
               axis: `A${axisNum}`,
               score: Math.round(finalScore),
               domain: domain,
               name: `Biological Axis ${axisNum}`,
               isCritical: finalScore > 85,
               isElevated: finalScore > 70 && finalScore <= 85,
               color: DOMAIN_COLOR[domain] || "#9CA3AF"
            };
         });
         setGraphData(newData);
         setIsAnalyzing(false);
      }, 1200);
   };

   const toggleSymptom = (key: string) => {
      setSelectedSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const clearAllSymptoms = () => {
      setSelectedSymptoms({});
   };

   const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
         const data = payload[0].payload;
         return (
            <div className="card" style={{ minWidth: '160px' }}>
               <div className="card-header" style={{ padding: '8px 12px' }}>
                  <div className="d-flex align-items-center gap-2">
                     <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: data.color }} />
                     <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                        {data.axis} • {data.domain}
                     </span>
                  </div>
               </div>
               <div className="p-3">
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#1F2937', marginBottom: '8px' }}>
                     {data.name}
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                     <span style={{ fontWeight: 700, fontSize: '18px', color: '#0A5C8E' }}>
                        {data.score}%
                     </span>
                     {data.isCritical && (
                        <span className="badge" style={{
                           background: '#FEF2F2',
                           color: '#DC2626',
                           fontSize: '8px',
                           fontWeight: 600,
                           padding: '2px 6px'
                        }}>
                           CRITICAL
                        </span>
                     )}
                  </div>
               </div>
            </div>
         );
      }
      return null;
   };

   // ✅ FIX: Create a copy before sorting to avoid modifying read-only array
   const criticalCount = graphData.filter(d => d.isCritical).length;
   const peakAxis = graphData.length > 0
      ? [...graphData].sort((a, b) => b.score - a.score)[0]?.axis || '--'
      : '--';

   return (
      <div>
         {/* ==================== HEADER ==================== */}
         <div className="d-flex justify-content-between align-items-center mb-6">
            <div>
               <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
                  Biological Network Graph
               </h1>
               <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
                  V-Twin Axis Propagation & Systemic Impact Mapping
               </p>
            </div>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }}>
               <Download size={14} className="me-1" /> Export Dataset
            </button>
         </div>

         {/* ==================== SIMULATION VARIABLE HUB ==================== */}
         <div className="card mb-6">
            <div className="card-header d-flex justify-content-between align-items-center">
               <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                  SIMULATION VARIABLE HUB
               </h3>
               <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '8px', height: '8px', background: '#059669', borderRadius: '50%' }} />
                  <span style={{ fontSize: '9px', fontWeight: 500, color: '#059669', letterSpacing: '0.3px' }}>
                     ENGINE READY
                  </span>
               </div>
            </div>
            <div className="p-4">
               <div className="d-flex flex-wrap gap-2 mb-4">
                  {SYMPTOM_QUICK.map((s) => (
                     <button
                        key={s.key}
                        onClick={() => toggleSymptom(s.key)}
                        className={`btn ${selectedSymptoms[s.key] ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '11px', padding: '6px 14px' }}
                     >
                        {selectedSymptoms[s.key] && <CheckCircle2 size={12} className="me-1" />}
                        {s.label}
                     </button>
                  ))}
                  {Object.keys(selectedSymptoms).length > 0 && (
                     <button
                        onClick={clearAllSymptoms}
                        className="btn btn-ghost"
                        style={{ fontSize: '11px', padding: '6px 12px', color: '#9CA3AF' }}
                     >
                        <X size={12} className="me-1" /> Clear All
                     </button>
                  )}
               </div>
               <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                  <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0 }}>
                     Select biological variables to simulate mechanistic impact across the 36-axis landscape.
                  </p>
                  <button
                     onClick={generateMockData}
                     disabled={isAnalyzing}
                     className="btn btn-primary"
                     style={{ fontSize: '11px', padding: '8px 20px' }}
                  >
                     {isAnalyzing ? (
                        <><Loader2 size={14} className="me-2 spinner-border" style={{ animationDuration: '1s' }} /> PROCESSING...</>
                     ) : (
                        <><Zap size={14} className="me-2" /> RUN PROPAGATION LOGIC</>
                     )}
                  </button>
               </div>
            </div>
         </div>

         {/* ==================== ANALYSIS VISUALIZATION ==================== */}
         <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ background: '#1F2937', borderBottom: 'none' }}>
               <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>
                  NEURAL AXIS PROPAGATION MAP
               </h3>
               <span className="badge" style={{
                  background: '#E8F0F5',
                  color: '#0A5C8E',
                  fontSize: '9px',
                  fontWeight: 500,
                  padding: '2px 8px'
               }}>
                  V-Twin Simulation Engine
               </span>
            </div>

            <div style={{ padding: '20px', background: '#F9FAFB', minHeight: '450px' }}>
               {isAnalyzing ? (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                     <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '40px', height: '40px' }}>
                           <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted text-xs mb-0">Running propagation algorithm...</p>
                     </div>
                  </div>
               ) : !isClient ? (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                     <p className="text-muted text-sm">Loading chart...</p>
                  </div>
               ) : (
                  <ResponsiveContainer width="100%" height={400}>
                     <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                           dataKey="axis"
                           axisLine={false}
                           tickLine={false}
                           tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }}
                           interval={5}
                        />
                        <YAxis
                           axisLine={false}
                           tickLine={false}
                           tick={{ fontSize: 10, fontWeight: 600, fill: '#6B7280' }}
                           domain={[0, 100]}
                           label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#6B7280' } }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
                        <ReferenceLine y={70} stroke="#DC2626" strokeDasharray="5 5" label={{
                           value: 'ELEVATED',
                           position: 'right',
                           fill: '#DC2626',
                           fontSize: 9,
                           fontWeight: 600
                        }} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={28}>
                           {graphData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </div>

            {/* Footer Stats */}
            <div className="card-footer" style={{ background: 'white' }}>
               <div className="row g-3 align-items-center">
                  <div className="col-md-4">
                     <div className="d-flex align-items-center gap-3" style={{ padding: '10px', background: '#F9FAFB', borderRadius: '6px' }}>
                        <div style={{
                           width: '36px',
                           height: '36px',
                           background: '#E8F0F5',
                           borderRadius: '6px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                        }}>
                           <Activity size={16} style={{ color: '#0A5C8E' }} />
                        </div>
                        <div>
                           <div style={{ fontSize: '9px', color: '#9CA3AF', letterSpacing: '0.3px' }}>PEAK LOAD AXIS</div>
                           <div style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>{peakAxis}</div>
                        </div>
                     </div>
                  </div>
                  <div className="col-md-4">
                     <div className="d-flex align-items-center gap-3" style={{ padding: '10px', background: '#F9FAFB', borderRadius: '6px' }}>
                        <div style={{
                           width: '36px',
                           height: '36px',
                           background: '#FEF2F2',
                           borderRadius: '6px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                        }}>
                           <AlertTriangle size={16} style={{ color: '#DC2626' }} />
                        </div>
                        <div>
                           <div style={{ fontSize: '9px', color: '#9CA3AF', letterSpacing: '0.3px' }}>CRITICAL OUTLIERS</div>
                           <div style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>{criticalCount} DETECTED</div>
                        </div>
                     </div>
                  </div>
                  <div className="col-md-4 text-end">
                     <button className="btn btn-outline" style={{ fontSize: '11px', padding: '8px 16px' }}>
                        <Settings2 size={14} className="me-2" /> Calibration Matrix
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}