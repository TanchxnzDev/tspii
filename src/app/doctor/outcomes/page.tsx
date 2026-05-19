"use client";

import { useState } from "react";
import {
   TrendingUp, TrendingDown, Minus, Plus, RefreshCw,
   User, BarChart2, CheckCircle, AlertTriangle,
   ArrowRight, Info, Pill, Calendar, Activity,
   Trophy, Users, Target, ShieldCheck, ArrowUpRight,
   ArrowDownRight, Loader2, Search, Settings2,
   X
} from "lucide-react";
import Link from "next/link";
import "./../theme-inapp.css";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
   improved: { label: "Improved", color: "success", icon: ArrowDownRight, bg: "success" },
   stable: { label: "Stable", color: "info", icon: Minus, bg: "info" },
   worsened: { label: "Warning", color: "danger", icon: ArrowUpRight, bg: "danger" },
};

export default function OutcomesPage() {
   const [showForm, setShowForm] = useState(false);
   const [expandedId, setExpandedId] = useState<number | null>(null);

   const outcomes = [
      { id: 1, name: "Somchai Jaidee", before: 85, after: 58, status: "improved", modules: ["PH-001", "PH-005"], date: "12 May 24" },
      { id: 2, name: "Wiphada Rakdee", before: 72, after: 68, status: "stable", modules: ["PH-002"], date: "10 May 24" },
      { id: 3, name: "Thanakorn Mungmun", before: 45, after: 62, status: "worsened", modules: ["PH-010"], date: "08 May 24" },
   ];

   return (
      <div className="pb-5">
         {/* 🧭 Header Section */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                     <Trophy size={24} />
                  </div>
                  Clinical Outcomes Tracking
               </h1>
               <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Institutional Success Metrics & Recovery Analytics</p>
            </div>
            <div className="d-flex gap-2">
               <button
                  onClick={() => setShowForm(!showForm)}
                  className={`btn btn-sm font-bold uppercase tracking-tighter px-4 shadow-sm d-flex align-items-center gap-2 ${showForm ? 'btn-light border bg-white' : 'btn-primary'}`}
               >
                  {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Close' : 'New Outcome'}
               </button>
            </div>
         </div>

         {/* 📊 High-Level Metrics */}
         <div className="row g-3 mb-4">
            {[
               { label: "Improved Rate", val: "84.2%", color: "success", icon: TrendingUp, desc: "Positive Trajectory" },
               { label: "Stable Status", val: "12.5%", color: "info", icon: Activity, desc: "Maintained Health" },
               { label: "Avg. Delta Score", val: "-24.5%", color: "primary", icon: Target, desc: "Burden Reduction" },
               { label: "Tracked Cases", val: "128", color: "dark", icon: Users, desc: "Total Active Plans" },
            ].map((s, idx) => (
               <div key={idx} className="col-lg-3 col-6">
                  <div className="card p-3 border-0 shadow-sm bg-white h-100">
                     <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-0">{s.label}</p>
                        <s.icon size={16} className={`text-${s.color} opacity-30`} />
                     </div>
                     <h3 className="fw-bold mb-0 h4 text-dark">{s.val}</h3>
                     <small className="text-[9px] text-muted font-bold uppercase tracking-tighter">{s.desc}</small>
                  </div>
               </div>
            ))}
         </div>

         <div className="row g-4">
            {/* New Outcome Form Area */}
            {showForm && (
               <div className="col-12 animate-in fade-in slide-in-from-top-4">
                  <div className="card border-0 shadow-lg bg-white rounded-4 overflow-hidden mb-4 border-primary border-opacity-10 border-top border-4">
                     <div className="card-header bg-transparent py-3 px-4 border-0">
                        <h5 className="fw-black text-dark text-xs uppercase tracking-widest mb-0">Initialize New Outcome Session</h5>
                     </div>
                     <div className="card-body p-4 pt-0">
                        <div className="row g-3">
                           <div className="col-md-4">
                              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Search Patient Identity</label>
                              <div className="input-group input-group-sm">
                                 <span className="input-group-text bg-light border-0"><Search size={14} className="text-muted" /></span>
                                 <input type="text" className="form-control bg-light border-0 font-bold text-xs" placeholder="HN or Name..." />
                              </div>
                           </div>
                           <div className="col-md-4">
                              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Baseline Burden (%)</label>
                              <input type="number" className="form-control bg-light border-0 font-bold text-xs p-2.5" placeholder="Previous Score" />
                           </div>
                           <div className="col-md-4">
                              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Current Burden (%)</label>
                              <input type="number" className="form-control bg-light border-0 font-bold text-xs p-2.5" placeholder="Current Score" />
                           </div>
                           <div className="col-12 mt-3">
                              <button className="btn btn-primary btn-sm px-4 font-bold uppercase tracking-widest text-[9px] shadow-sm">Confirm & Save Outcome</button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* 📋 Patient Recovery Progress Registry */}
            <div className="col-12">
               <div className="card shadow-sm border-0 bg-white overflow-hidden rounded-4">
                  <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center px-4">
                     <div className="d-flex align-items-center gap-2">
                        <Activity size={16} className="text-primary" />
                        <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Patient Recovery Registry</h3>
                     </div>
                     <div className="text-[10px] font-bold text-muted uppercase tracking-widest d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-1"><div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div> Improving</div>
                        <div className="d-flex align-items-center gap-1"><div className="bg-info rounded-circle" style={{ width: 8, height: 8 }}></div> Stable</div>
                     </div>
                  </div>

                  <div className="table-responsive">
                     <table className="table table-hover align-middle mb-0 text-nowrap">
                        <thead className="bg-light border-bottom text-[10px] uppercase font-bold text-muted tracking-wider">
                           <tr>
                              <th className="px-4 py-3">Patient Discovery</th>
                              <th className="py-3 text-center">Baseline Burden</th>
                              <th className="py-3 text-center">Current Burden</th>
                              <th className="py-3 text-center">Outcome Status</th>
                              <th className="py-3">Calibration Date</th>
                              <th className="py-3 text-end pr-4">Analysis</th>
                           </tr>
                        </thead>
                        <tbody>
                           {outcomes.map((o) => {
                              const status = STATUS_CONFIG[o.status];
                              const delta = o.before - o.after;
                              const isPositive = delta >= 0;
                              return (
                                 <tr key={o.id} className="border-bottom border-light transition-all hover:bg-light bg-opacity-30">
                                    <td className="px-4 py-3">
                                       <div className="d-flex align-items-center gap-3">
                                          <div className="bg-light border rounded-circle w-8 h-8 d-flex items-center justify-center font-bold text-xs shadow-xs text-dark opacity-50">
                                             {o.name.charAt(0)}
                                          </div>
                                          <div>
                                             <div className="text-xs font-black text-dark mb-0 uppercase tracking-tighter">{o.name}</div>
                                             <div className="text-[9px] text-muted font-bold uppercase tracking-widest">TSPI-00{o.id}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="py-3 text-center">
                                       <span className="text-xs font-bold text-muted">{o.before}%</span>
                                    </td>
                                    <td className="py-3 text-center">
                                       <div className="d-flex align-items-center justify-content-center gap-2">
                                          <span className="text-xs font-black text-dark">{o.after}%</span>
                                          <div className={`d-flex align-items-center gap-1 text-[10px] font-black ${isPositive ? 'text-success' : 'text-danger'}`}>
                                             {isPositive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                             {Math.abs(delta)}%
                                          </div>
                                       </div>
                                    </td>
                                    <td className="py-3 text-center">
                                       <span className={`badge bg-${status.color} bg-opacity-10 text-${status.color} text-[9px] uppercase px-3 py-1 border border-${status.color} border-opacity-20 font-black d-inline-flex align-items-center gap-1`}>
                                          <status.icon size={10} /> {status.label}
                                       </span>
                                    </td>
                                    <td className="py-3">
                                       <div className="d-flex align-items-center gap-2 text-xs font-bold text-muted">
                                          <Calendar size={12} className="opacity-50" /> {o.date}
                                       </div>
                                    </td>
                                    <td className="py-3 text-end pr-4">
                                       <button className="btn btn-light btn-xs border font-bold uppercase tracking-widest px-3 shadow-xs">
                                          Review Delta <ArrowRight size={10} className="ms-1" />
                                       </button>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         <div className="mt-5 p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10 d-flex align-items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
               <ShieldCheck size={20} />
            </div>
            <div>
               <h6 className="fw-bold text-primary mb-1 text-sm uppercase tracking-widest">Clinical QA Governance</h6>
               <p className="text-[11px] text-muted mb-0">Outcome tracking is a mandatory requirement for institutional quality assurance. Delta scores are analyzed longitudinally to ensure therapeutic protocols are meeting clinical efficacy benchmarks.</p>
            </div>
         </div>
      </div>
   );
}

