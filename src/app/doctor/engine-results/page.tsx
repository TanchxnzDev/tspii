"use client";

import { useState, useEffect } from "react";
import {
   ClipboardList, CheckCircle, AlertTriangle, Clock,
   ChevronDown, ChevronUp, Search, RefreshCw, User,
   Brain, FileText, Star, Zap, Activity, Loader2,
   ShieldCheck, Cpu, Target, ArrowRightCircle,
   ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getEngineResults } from "@/utils/firebase/services";
import "./../theme-inapp.css";

const BURDEN_COLORS: Record<string, string> = {
   high: "danger",
   medium: "warning",
   low: "success"
};

export default function EngineResultsPage() {
   const [expandedId, setExpandedId] = useState<string | null>(null);
   const [results, setResults] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadResults = async () => {
         try {
            const data = await getEngineResults();
            setResults(data);
         } catch (err) {
            console.error("Error loading engine results:", err);
         } finally {
            setLoading(false);
         }
      };
      loadResults();
   }, []);

   const getBurdenLevel = (score: number) => {
      if (score > 70) return "high";
      if (score > 40) return "medium";
      return "low";
   };

   return (
      <div className="pb-5">
         {/* 🧭 Header Section */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                     <ClipboardList size={24} />
                  </div>
                  Engine Run History
               </h1>
               <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">V-Twin Intelligence Audit Logs & Neural Output Archive</p>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-4 shadow-sm d-flex align-items-center gap-2">
                  <RefreshCw size={14} /> Refresh Logs
               </button>
            </div>
         </div>

         {/* 📊 High-Level Metrics */}
         <div className="row g-3 mb-4">
            {[
               { label: "Total Engine Runs", val: "1,240", color: "primary", icon: Cpu, desc: "Neural Computations" },
               { label: "Urgent Review", val: "42", color: "danger", icon: AlertTriangle, desc: "High Burden Detected" },
               { label: "Pending Audit", val: "15", color: "warning", icon: Clock, desc: "Clinical Verification" },
               { label: "Avg. Burden Score", val: "54.2%", color: "success", icon: Activity, desc: "Network Statistics" },
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

         {/* 🔍 Search & Filters Hub */}
         <div className="card shadow-sm border-0 mb-4 bg-white">
            <div className="card-body p-3">
               <div className="row align-items-center g-3">
                  <div className="col-md-9">
                     <div className="input-group">
                        <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
                        <input
                           type="text"
                           className="form-control bg-light border-0 font-bold text-sm"
                           placeholder="Search engine runs by Patient Name, HN or Session ID..."
                        />
                     </div>
                  </div>
                  <div className="col-md-3 text-md-end">
                     <select className="form-select bg-light border-0 text-xs font-bold p-2 h-100 shadow-none">
                        <option>All Statuses</option>
                        <option>Critical</option>
                        <option>Completed</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         {/* 🏟️ Neural Run Board */}
         <div className="card shadow-sm border-0 bg-white overflow-hidden rounded-4">
            <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center px-4">
               <div className="d-flex align-items-center gap-2">
                  <Brain size={16} className="text-primary" />
                  <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Intelligence Execution Registry</h3>
               </div>
               <div className="text-[10px] font-bold text-muted uppercase tracking-widest d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-1"><div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div> Verified</div>
                  <div className="d-flex align-items-center gap-1"><div className="bg-warning rounded-circle" style={{ width: 8, height: 8 }}></div> In Review</div>
               </div>
            </div>

            <div className="table-responsive">
               <table className="table table-hover align-middle mb-0 text-nowrap">
                  <thead className="bg-light border-bottom text-[10px] uppercase font-bold text-muted tracking-wider">
                     <tr>
                        <th className="px-4 py-3" style={{ width: '60px' }}>#</th>
                        <th className="py-3">Execution Time</th>
                        <th className="py-3">Patient Identity</th>
                        <th className="py-3 text-center">Systemic Burden</th>
                        <th className="py-3 text-center">Status</th>
                        <th className="py-3 text-end pr-4">Details</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr><td colSpan={6} className="text-center py-5"><Loader2 className="animate-spin text-primary opacity-20" size={32} /></td></tr>
                     ) : results.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="text-center py-5">
                              <div className="opacity-10 mb-2"><Cpu size={48} className="mx-auto" /></div>
                              <p className="text-muted italic text-xs font-bold mb-0">No engine execution logs found in the institutional archive.</p>
                           </td>
                        </tr>
                     ) : results.map((run, index) => {
                        const burdenLevel = getBurdenLevel(run.burden_score);
                        return (
                           <tr key={run.id} className="border-bottom border-light transition-all cursor-pointer hover:bg-light bg-opacity-30">
                              <td className="px-4 py-3">
                                 <span className="text-[10px] font-mono text-muted font-bold">#{index + 1}</span>
                              </td>
                              <td className="py-3">
                                 <div className="d-flex align-items-center gap-2 text-xs font-bold text-dark">
                                    <Clock size={12} className="text-primary opacity-50" />
                                    {run.timestamp ? new Date(run.timestamp.seconds * 1000).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'N/A'}
                                 </div>
                              </td>
                              <td className="py-3">
                                 <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light border rounded-circle w-8 h-8 d-flex items-center justify-center font-bold text-xs shadow-xs text-dark opacity-50">
                                       {(run.patient_name || "P").charAt(0)}
                                    </div>
                                    <div>
                                       <div className="text-xs font-black text-dark mb-0 uppercase tracking-tighter">{run.patient_name || "Unknown Target"}</div>
                                       <div className="text-[9px] text-muted font-bold uppercase tracking-widest">HN: {run.patient_hn || "TSPI-9988"}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-3 text-center">
                                 <div className="d-flex flex-column align-items-center">
                                    <div className="fw-black text-dark text-xs mb-1">{run.burden_score}%</div>
                                    <div className="progress w-100" style={{ height: '3px', maxWidth: '80px' }}>
                                       <div className={`progress-bar bg-${BURDEN_COLORS[burdenLevel]}`} style={{ width: `${run.burden_score}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-3 text-center">
                                 <span className={`badge bg-${run.status === 'Verified' ? 'success' : 'warning'} bg-opacity-10 text-${run.status === 'Verified' ? 'success' : 'warning'} text-[9px] uppercase px-3 py-1 border border-${run.status === 'Verified' ? 'success' : 'warning'} border-opacity-20 font-black`}>
                                    {run.status || "In Review"}
                                 </span>
                              </td>
                              <td className="py-3 text-end pr-4">
                                 <Link href={`/doctor/ai-physician?id=${run.patient_id}`} className="btn btn-light btn-xs border font-bold uppercase tracking-widest px-3 shadow-xs">
                                    Analyze <ChevronRight size={10} className="ms-1" />
                                 </Link>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="mt-5 p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10 d-flex align-items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
               <ShieldCheck size={20} />
            </div>
            <div>
               <h6 className="fw-bold text-primary mb-1 text-sm uppercase tracking-widest">Intelligence Governance Protocol</h6>
               <p className="text-[11px] text-muted mb-0">All V-Twin Engine execution results are non-destructively archived and timestamped for clinical auditing and longitudinal patient tracking. Results with burden scores exceeding 70% require manual physician verification.</p>
            </div>
         </div>
      </div>
   );
}
