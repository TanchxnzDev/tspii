"use client";

import { useState } from "react";
import {
   Brain, Zap, Activity, AlertTriangle, Target,
   Package, Search, RefreshCw, FileText, CheckCircle,
   Info, Sparkles, Microscope, Users, ClipboardCheck,
   ShieldCheck, ArrowRightCircle, Loader2, Filter,
   FlaskConical, X
} from "lucide-react";
import Link from "next/link";

export default function ClinicalReviewPage() {
   const [activeTab, setActiveTab] = useState("roots");
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [result, setResult] = useState<any>(null);
   const [searchTerm, setSearchTerm] = useState("");

   const handleRunEngine = () => {
      setIsAnalyzing(true);
      setTimeout(() => {
         setResult({
            burden: 72,
            criticalCount: 4,
            roots: [
               { name: "Chronic Inflammation", axis: "D1", confidence: 0.88, description: "Systemic inflammatory markers exceed optimal threshold by 12%. CRP levels indicate ongoing low-grade inflammation affecting multiple biological axes." },
               { name: "Insulin Resistance", axis: "D3", confidence: 0.75, description: "Hyperinsulinemia detected alongside metabolic axis deregulation. HbA1c trending upward over 3 consecutive measurements." }
            ],
            modules: [
               { name: "Detox Formula", priority: 1, type: "Supplements", category: "Nutraceutical" },
               { name: "Anti-Inflammatory Plan", priority: 1, type: "Lifestyle", category: "Protocol" },
               { name: "Omega-3 Support", priority: 2, type: "Supplements", category: "Nutraceutical" }
            ]
         });
         setIsAnalyzing(false);
      }, 1500);
   };

   const handleClear = () => {
      setResult(null);
      setSearchTerm("");
   };

   return (
      <div>
         {/* ==================== HEADER ==================== */}
         <div className="d-flex justify-content-between align-items-center mb-6">
            <div>
               <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
                  Clinical Intelligence Review
               </h1>
               <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
                  V-Twin Audit Engine & Mechanistic Case Analysis
               </p>
            </div>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }}>
               <FileText size={14} className="me-1" /> Case History
            </button>
         </div>

         <div className="row g-6">
            {/* ==================== LEFT COLUMN: INPUT HUB ==================== */}
            <div className="col-lg-4">
               <div className="card mb-6">
                  <div className="card-header">
                     <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                        ANALYSIS PARAMETER HUB
                     </h3>
                  </div>
                  <div className="p-4">
                     {/* Search */}
                     <div className="mb-5">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                           Search Case Database
                        </label>
                        <div className="search-bar" style={{ width: '100%' }}>
                           <Search size={14} style={{ color: '#9CA3AF' }} />
                           <input
                              type="text"
                              placeholder="Patient Name or HN..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                           {searchTerm && (
                              <button onClick={() => setSearchTerm("")} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                 <X size={12} style={{ color: '#9CA3AF' }} />
                              </button>
                           )}
                        </div>
                     </div>

                     {/* Active Symptoms */}
                     <div className="mb-5">
                        <h6 style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '12px', letterSpacing: '0.3px' }}>
                           <Activity size={12} style={{ color: '#0A5C8E', display: 'inline', marginRight: '6px' }} />
                           ACTIVE SYMPTOMOLOGY
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                           {["Fatigue", "Insomnia", "Digestive Discomfort"].map(s => (
                              <span key={s} className="badge" style={{
                                 background: '#F3F4F6',
                                 color: '#4B5563',
                                 fontSize: '10px',
                                 fontWeight: 500,
                                 padding: '4px 10px',
                                 borderRadius: '4px'
                              }}>
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>

                     {/* Primary Biomarkers */}
                     <div className="mb-5">
                        <h6 style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '12px', letterSpacing: '0.3px' }}>
                           <FlaskConical size={12} style={{ color: '#0A5C8E', display: 'inline', marginRight: '6px' }} />
                           PRIMARY BIOMARKERS
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                           {["Elevated CRP", "HbA1c > 6.0", "LDL > 130"].map(s => (
                              <span key={s} className="badge" style={{
                                 background: '#E8F0F5',
                                 color: '#0A5C8E',
                                 fontSize: '10px',
                                 fontWeight: 500,
                                 padding: '4px 10px',
                                 borderRadius: '4px'
                              }}>
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div style={{ padding: '16px', borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                     <button
                        onClick={handleRunEngine}
                        disabled={isAnalyzing}
                        className="btn btn-primary w-100"
                        style={{ fontSize: '12px', padding: '10px' }}
                     >
                        {isAnalyzing ? (
                           <><Loader2 size={14} className="me-2 spinner-border" style={{ animationDuration: '1s' }} /> EXECUTING...</>
                        ) : (
                           <><Zap size={14} className="me-2" /> EXECUTE CLINICAL ENGINE</>
                        )}
                     </button>
                     {result && !isAnalyzing && (
                        <button
                           onClick={handleClear}
                           className="btn btn-outline w-100 mt-3"
                           style={{ fontSize: '12px', padding: '8px' }}
                        >
                           Clear Results
                        </button>
                     )}
                  </div>
               </div>

               {/* Info Card */}
               <div className="card" style={{ background: '#F9FAFB' }}>
                  <div className="p-4">
                     <div className="d-flex align-items-start gap-3">
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
                           <ShieldCheck size={14} style={{ color: '#0A5C8E' }} />
                        </div>
                        <div>
                           <h6 style={{ fontWeight: 600, fontSize: '11px', color: '#0A5C8E', marginBottom: '4px', letterSpacing: '0.3px' }}>
                              CLINICAL GROUNDING
                           </h6>
                           <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                              Mechanistic findings are cross-referenced with the Institutional Precision Medicine protocol library for diagnostic grounding.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ==================== RIGHT COLUMN: RESULTS ==================== */}
            <div className="col-lg-8">
               {!result && !isAnalyzing ? (
                  // Empty State
                  <div className="card text-center py-5" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ marginBottom: '20px' }}>
                        <div style={{
                           width: '80px',
                           height: '80px',
                           background: '#F3F4F6',
                           borderRadius: '12px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           margin: '0 auto 16px'
                        }}>
                           <Brain size={40} style={{ color: '#D1D5DB' }} />
                        </div>
                        <h4 style={{ fontWeight: 500, fontSize: '16px', color: '#1F2937', marginBottom: '8px' }}>
                           Neural Analysis Console
                        </h4>
                        <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '320px', margin: '0 auto' }}>
                           Select a patient and click 'Execute' to begin the systemic burden analysis and mechanistic root cause discovery.
                        </p>
                     </div>
                  </div>
               ) : isAnalyzing ? (
                  // Loading State
                  <div className="card text-center py-5" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div>
                        <div className="spinner-border text-primary mb-4" role="status" style={{ width: '48px', height: '48px' }}>
                           <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5 style={{ fontWeight: 500, fontSize: '14px', color: '#1F2937', marginBottom: '4px' }}>
                           Applying V-Twin Logic
                        </h5>
                        <p style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.3px' }}>
                           Correlating Biomarkers with 36-Axis Matrix...
                        </p>
                     </div>
                  </div>
               ) : (
                  // Results State
                  <div>
                     {/* Summary Cards */}
                     <div className="row g-4 mb-6">
                        <div className="col-md-6">
                           <div className="card p-4">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                 <p style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px', margin: 0 }}>
                                    SYSTEMIC BURDEN SCORE
                                 </p>
                                 <Activity size={16} style={{ color: '#D1D5DB' }} />
                              </div>
                              <div className="d-flex align-items-baseline gap-2">
                                 <h2 style={{ fontWeight: 700, fontSize: '32px', color: '#DC2626', margin: 0 }}>
                                    {result.burden}%
                                 </h2>
                                 <span className="badge" style={{
                                    background: '#FEF2F2',
                                    color: '#DC2626',
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    padding: '3px 8px'
                                 }}>
                                    CRITICAL LOAD
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-6">
                           <div className="card p-4" style={{ background: '#1F2937' }}>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                 <p style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.3px', margin: 0 }}>
                                    DETECTED OUTLIERS
                                 </p>
                                 <Target size={16} style={{ color: '#6B7280' }} />
                              </div>
                              <h2 style={{ fontWeight: 700, fontSize: '32px', color: 'white', margin: 0 }}>
                                 {result.criticalCount} <span style={{ fontSize: '12px', fontWeight: 400, color: '#9CA3AF' }}>BIOLOGICAL AXES</span>
                              </h2>
                           </div>
                        </div>
                     </div>

                     {/* Tabs */}
                     <div className="card">
                        <div className="card-header" style={{ padding: 0, borderBottom: '1px solid #F3F4F6' }}>
                           <div className="d-flex">
                              <button
                                 onClick={() => setActiveTab("roots")}
                                 className="btn"
                                 style={{
                                    padding: '12px 20px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    letterSpacing: '0.3px',
                                    background: activeTab === 'roots' ? 'transparent' : 'transparent',
                                    color: activeTab === 'roots' ? '#0A5C8E' : '#9CA3AF',
                                    borderBottom: activeTab === 'roots' ? '2px solid #0A5C8E' : 'none',
                                    borderRadius: 0
                                 }}
                              >
                                 <Zap size={14} className="me-2" style={{ display: 'inline' }} />
                                 MECHANISTIC ROOT CAUSES
                              </button>
                              <button
                                 onClick={() => setActiveTab("modules")}
                                 className="btn"
                                 style={{
                                    padding: '12px 20px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    letterSpacing: '0.3px',
                                    background: activeTab === 'modules' ? 'transparent' : 'transparent',
                                    color: activeTab === 'modules' ? '#0A5C8E' : '#9CA3AF',
                                    borderBottom: activeTab === 'modules' ? '2px solid #0A5C8E' : 'none',
                                    borderRadius: 0
                                 }}
                              >
                                 <Package size={14} className="me-2" style={{ display: 'inline' }} />
                                 PROTOCOL RECOMMENDATIONS
                              </button>
                           </div>
                        </div>

                        <div className="p-4" style={{ minHeight: '320px' }}>
                           {activeTab === 'roots' ? (
                              <div>
                                 {result.roots.map((root: any, idx: number) => (
                                    <div
                                       key={idx}
                                       style={{
                                          padding: '16px',
                                          background: '#F9FAFB',
                                          borderRadius: '8px',
                                          border: '1px solid #F3F4F6',
                                          marginBottom: idx === result.roots.length - 1 ? 0 : '16px'
                                       }}
                                    >
                                       <div className="d-flex align-items-start gap-3">
                                          <div style={{
                                             width: '36px',
                                             height: '36px',
                                             background: '#E8F0F5',
                                             borderRadius: '6px',
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                             fontWeight: 700,
                                             fontSize: '12px',
                                             color: '#0A5C8E'
                                          }}>
                                             {root.axis}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                             <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                                <h6 style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937', margin: 0 }}>
                                                   {root.name}
                                                </h6>
                                                <span className="badge" style={{
                                                   background: '#F3F4F6',
                                                   color: '#6B7280',
                                                   fontSize: '9px',
                                                   fontWeight: 500,
                                                   padding: '2px 6px'
                                                }}>
                                                   Confidence: {(root.confidence * 100).toFixed(0)}%
                                                </span>
                                             </div>
                                             <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                                                {root.description}
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="table-responsive">
                                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                       <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                          <th style={{ padding: '10px 0', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#6B7280', width: '70px' }}>
                                             PRIORITY
                                          </th>
                                          <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#6B7280' }}>
                                             THERAPEUTIC MODULE
                                          </th>
                                          <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#6B7280' }}>
                                             CATEGORY
                                          </th>
                                          <th style={{ padding: '10px 0', textAlign: 'right', fontSize: '10px', fontWeight: 600, color: '#6B7280', width: '100px' }}>
                                             ACTION
                                          </th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {result.modules.map((module: any, idx: number) => (
                                          <tr key={idx} style={{ borderBottom: idx === result.modules.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                                             <td style={{ padding: '12px 0' }}>
                                                <div style={{
                                                   width: '28px',
                                                   height: '28px',
                                                   background: module.priority === 1 ? '#FEF2F2' : '#E8F0F5',
                                                   borderRadius: '4px',
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   justifyContent: 'center',
                                                   fontWeight: 600,
                                                   fontSize: '11px',
                                                   color: module.priority === 1 ? '#DC2626' : '#0A5C8E'
                                                }}>
                                                   {module.priority}
                                                </div>
                                             </td>
                                             <td style={{ padding: '12px 12px' }}>
                                                <div style={{ fontWeight: 500, fontSize: '13px', color: '#1F2937' }}>
                                                   {module.name}
                                                </div>
                                             </td>
                                             <td style={{ padding: '12px 12px' }}>
                                                <span className="badge" style={{
                                                   background: '#F3F4F6',
                                                   color: '#4B5563',
                                                   fontSize: '9px',
                                                   fontWeight: 500,
                                                   padding: '2px 8px'
                                                }}>
                                                   {module.type}
                                                </span>
                                             </td>
                                             <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                <button className="btn btn-outline" style={{ fontSize: '9px', padding: '4px 12px' }}>
                                                   Add to Plan
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Footer Action */}
                     <div className="text-center mt-6">
                        <button className="btn btn-primary" style={{ fontSize: '11px', padding: '8px 20px' }}>
                           <Sparkles size={14} className="me-2" /> Full Clinical Synthesis Report
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}