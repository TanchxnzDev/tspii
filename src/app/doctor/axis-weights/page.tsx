"use client";

import { useState } from "react";
import {
   Sliders, Search, RefreshCw, Save, ChevronDown, ChevronUp,
   AlertTriangle, CheckCircle, Beaker, Activity, Leaf,
   Layers, Zap, BarChart2, Target, ShieldAlert, Settings2,
   Undo2, Info, X
} from "lucide-react";
import Link from "next/link";

export default function AxisWeightsPage() {
   const [expandedId, setExpandedId] = useState<string | null>("D3-Ax1");
   const [search, setSearch] = useState("");
   const [selectedDomain, setSelectedDomain] = useState("all");
   const [weights, setWeights] = useState<Record<string, number>>({
      "D3-Ax1": 0.85,
      "D1-Ax2": 0.62,
      "D8-Ax4": 0.74,
   });

   const axes = [
      { id: "D3-Ax1", name: "Glucose Metabolism", domain: "D3", symptom_count: 8, lab_count: 5, description: "Regulates insulin sensitivity and glucose homeostasis. Critical for metabolic syndrome assessment." },
      { id: "D1-Ax2", name: "Systemic Inflammation", domain: "D1", symptom_count: 12, lab_count: 4, description: "Monitors inflammatory markers including CRP, ESR, and cytokine profiles." },
      { id: "D8-Ax4", name: "Cardiovascular Risk", domain: "D8", symptom_count: 5, lab_count: 10, description: "Evaluates lipid profiles, blood pressure, and vascular health indicators." },
   ];

   const filteredAxes = axes.filter(ax => {
      const matchesSearch = ax.name.toLowerCase().includes(search.toLowerCase()) ||
         ax.id.toLowerCase().includes(search.toLowerCase());
      const matchesDomain = selectedDomain === "all" || ax.domain === selectedDomain;
      return matchesSearch && matchesDomain;
   });

   const handleWeightChange = (id: string, value: number) => {
      setWeights(prev => ({ ...prev, [id]: value }));
   };

   const handleResetDefaults = () => {
      setWeights({
         "D3-Ax1": 0.85,
         "D1-Ax2": 0.62,
         "D8-Ax4": 0.74,
      });
   };

   const handleSave = () => {
      console.log("Saved weights:", weights);
      // TODO: Save to Firestore
   };

   return (
      <div>
         {/* ==================== HEADER ==================== */}
         <div className="d-flex justify-content-between align-items-center mb-6">
            <div>
               <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
                  Axis Weights Editor
               </h1>
               <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
                  Algorithm Calibration & Engine Precision Tuning
               </p>
            </div>
            <div className="d-flex gap-2">
               <button
                  onClick={handleResetDefaults}
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
               >
                  <Undo2 size={14} className="me-1" /> Reset Defaults
               </button>
               <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
               >
                  <Save size={14} className="me-1" /> Commit Weights
               </button>
            </div>
         </div>

         {/* ==================== SAFETY WARNING ==================== */}
         <div className="card mb-6" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div className="p-4">
               <div className="d-flex align-items-start gap-4">
                  <div style={{
                     width: '48px',
                     height: '48px',
                     background: '#D97706',
                     borderRadius: '8px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     flexShrink: 0
                  }}>
                     <ShieldAlert size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                     <h6 style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937', marginBottom: '4px', letterSpacing: '0.3px' }}>
                        INSTITUTIONAL ALGORITHM WARNING
                     </h6>
                     <p style={{ fontSize: '11px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                        Adjusting these weights will immediately recalibrate the <strong>Burden Score</strong> and
                        <strong> Diagnostic Priority</strong> for all patient sessions across the institutional network.
                        Ensure all calibrations are verified by the clinical committee.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* ==================== SEARCH & FILTERS ==================== */}
         <div className="card mb-6">
            <div className="card-body p-4">
               <div className="row g-3 align-items-center">
                  <div className="col-md-8">
                     <div className="search-bar" style={{ width: '100%' }}>
                        <Search size={14} style={{ color: '#9CA3AF' }} />
                        <input
                           type="text"
                           placeholder="Search biological markers, clinical symptoms, or axis IDs..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                           <button
                              onClick={() => setSearch("")}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                           >
                              <X size={12} style={{ color: '#9CA3AF' }} />
                           </button>
                        )}
                     </div>
                  </div>
                  <div className="col-md-4">
                     <select
                        className="form-select"
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        style={{
                           width: '100%',
                           padding: '8px 12px',
                           border: '1px solid #E5E7EB',
                           borderRadius: '6px',
                           fontSize: '12px',
                           background: '#F9FAFB'
                        }}
                     >
                        <option value="all">All Domains</option>
                        <option value="D3">Metabolic (D3)</option>
                        <option value="D1">Immune (D1)</option>
                        <option value="D8">Vascular (D8)</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         {/* ==================== WEIGHTS TUNING REGISTRY ==================== */}
         <div className="d-flex flex-column gap-4">
            {filteredAxes.length === 0 ? (
               <div className="card text-center py-5">
                  <Sliders size={40} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
                  <p className="text-muted text-sm mb-0">No axes match your search criteria</p>
               </div>
            ) : (
               filteredAxes.map((ax) => {
                  const currentWeight = weights[ax.id] || ax.weight;
                  const isExpanded = expandedId === ax.id;

                  return (
                     <div key={ax.id} className="card">
                        {/* Header - Click to expand/collapse */}
                        <div
                           className="p-4 d-flex align-items-center gap-3 cursor-pointer"
                           style={{ cursor: 'pointer' }}
                           onClick={() => setExpandedId(isExpanded ? null : ax.id)}
                        >
                           <div style={{
                              width: '44px',
                              height: '44px',
                              background: '#E8F0F5',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#0A5C8E'
                           }}>
                              {ax.domain}
                           </div>

                           <div style={{ flex: 1 }}>
                              <h6 style={{ fontWeight: 600, fontSize: '15px', color: '#1F2937', marginBottom: '4px' }}>
                                 {ax.name}
                              </h6>
                              <div className="d-flex gap-3">
                                 <div className="d-flex align-items-center gap-1">
                                    <Activity size={10} style={{ color: '#9CA3AF' }} />
                                    <span style={{ fontSize: '9px', color: '#6B7280', letterSpacing: '0.3px' }}>
                                       {ax.symptom_count} Symptoms
                                    </span>
                                 </div>
                                 <div className="d-flex align-items-center gap-1">
                                    <Beaker size={10} style={{ color: '#9CA3AF' }} />
                                    <span style={{ fontSize: '9px', color: '#6B7280', letterSpacing: '0.3px' }}>
                                       {ax.lab_count} Lab Markers
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="text-end me-3">
                              <div style={{ fontSize: '9px', color: '#9CA3AF', letterSpacing: '0.3px' }}>ENGINE IMPACT</div>
                              <span style={{ fontWeight: 700, fontSize: '20px', color: '#0A5C8E' }}>
                                 {(currentWeight * 100).toFixed(0)}%
                              </span>
                           </div>

                           <div style={{ color: '#9CA3AF' }}>
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                           </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                           <div className="p-4 pt-0" style={{ borderTop: '1px solid #F3F4F6' }}>
                              <div className="row g-4 mt-2">
                                 <div className="col-md-7">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                       <label style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                                          MECHANISTIC RELEVANCE WEIGHT
                                       </label>
                                       <span style={{ fontSize: '11px', fontWeight: 600, color: '#0A5C8E' }}>
                                          {(currentWeight * 100).toFixed(1)}% / 100%
                                       </span>
                                    </div>
                                    <input
                                       type="range"
                                       className="custom-range"
                                       min="0"
                                       max="1"
                                       step="0.01"
                                       value={currentWeight}
                                       onChange={(e) => handleWeightChange(ax.id, parseFloat(e.target.value))}
                                       style={{
                                          width: '100%',
                                          height: '4px',
                                          borderRadius: '2px',
                                          background: '#E5E7EB',
                                          WebkitAppearance: 'none'
                                       }}
                                    />
                                    <div className="d-flex justify-content-between mt-2">
                                       <span style={{ fontSize: '9px', color: '#9CA3AF' }}>LOW SENSITIVITY</span>
                                       <span style={{ fontSize: '9px', color: '#9CA3AF' }}>HIGH SENSITIVITY</span>
                                    </div>
                                 </div>

                                 <div className="col-md-5">
                                    <div style={{
                                       padding: '14px',
                                       background: '#F9FAFB',
                                       borderRadius: '6px',
                                       border: '1px solid #F3F4F6'
                                    }}>
                                       <div className="d-flex align-items-center gap-2 mb-2">
                                          <Target size={12} style={{ color: '#0A5C8E' }} />
                                          <span style={{ fontSize: '9px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
                                             CALIBRATION CONTEXT
                                          </span>
                                       </div>
                                       <p style={{ fontSize: '10px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                                          {ax.description}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })
            )}
         </div>

         {/* ==================== INFO FOOTER ==================== */}
         <div className="mt-6" style={{
            padding: '16px 20px',
            background: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
         }}>
            <div style={{
               width: '32px',
               height: '32px',
               background: '#E8F0F5',
               borderRadius: '6px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               flexShrink: 0
            }}>
               <Info size={14} style={{ color: '#0A5C8E' }} />
            </div>
            <div>
               <h6 style={{ fontWeight: 600, fontSize: '11px', color: '#0A5C8E', marginBottom: '4px', letterSpacing: '0.3px' }}>
                  PRECISION TUNING PROTOCOL
               </h6>
               <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  Weight calibration is performed based on institutional clinical outcomes data.
                  The current configuration is aligned with the <strong style={{ color: '#1F2937' }}>TSPI Clinical Constitution v3.2</strong>.
                  All changes are logged for algorithmic auditing.
               </p>
            </div>
         </div>

         <style jsx global>{`
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0A5C8E;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .custom-range::-webkit-slider-thumb:hover {
          background: #064663;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
      </div>
   );
}