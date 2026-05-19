"use client";

import { useState } from "react";
import {
   ClipboardCheck, CheckCircle, XCircle, AlertTriangle,
   Clock, RefreshCw, User, Brain, Edit3, Shield,
   Search, Zap, ShieldCheck,
   ChevronDown, ChevronUp, Loader2, Filter, Settings2,
   ArrowRightCircle
} from "lucide-react";
import Link from "next/link";
import "./../theme-inapp.css";

export default function ValidationsPage() {
   const [expandedId, setExpandedId] = useState<number | null>(1);

   const items = [
      { id: 1, patient: "Somchai Jaidee", status: "pending_review", urgent: true, burden: 82, type: "AI Diagnosis", time: "10m ago" },
      { id: 2, patient: "Wiphada Rakdee", status: "staff_reviewed", urgent: false, burden: 54, type: "Lab Analysis", time: "1h ago" },
      { id: 3, patient: "Mana Khayan", status: "ai_generated", urgent: false, burden: 35, type: "Health Intake", time: "2h ago" },
   ];

   const STATUS_MAP: any = {
      ai_generated: { label: "AI Generated", color: "info" },
      pending_review: { label: "Pending Physician", color: "warning" },
      staff_reviewed: { label: "Staff Verified", color: "primary" },
   };

   return (
      <div className="pb-5">
         {/* 🧭 Header Section */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                     <ClipboardCheck size={24} />
                  </div>
                  Clinical Validations
               </h1>
               <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Decision Support Hub & Algorithmic Verification Station</p>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-4 shadow-sm d-flex align-items-center gap-2">
                  <Shield size={14} /> Governance Dashboard
               </button>
            </div>
         </div>

         <div className="row g-4">
            {/* 🔍 Search & Filters Hub */}
            <div className="col-lg-12">
               <div className="card shadow-sm border-0 bg-white mb-4 rounded-4 overflow-hidden">
                  <div className="card-body p-3">
                     <div className="row align-items-center g-3">
                        <div className="col-md-9">
                           <div className="input-group">
                              <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
                              <input
                                 type="text"
                                 className="form-control bg-light border-0 font-bold text-sm"
                                 placeholder="Filter validations by Patient Name, HN or Diagnostic Type..."
                              />
                           </div>
                        </div>
                        <div className="col-md-3 text-md-end">
                           <select className="form-select bg-light border-0 text-xs font-bold p-2 h-100 shadow-none">
                              <option>Status: Pending Review</option>
                              <option>Status: Approved</option>
                              <option>Status: Incomplete</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 📋 Validation List */}
            <div className="col-lg-12">
               <div className="d-flex flex-column gap-3">
                  {items.map((item) => (
                     <div key={item.id} className={`card border-0 shadow-sm bg-white overflow-hidden rounded-4 transition-all hover:shadow-md ${item.urgent ? 'border-start border-4 border-danger' : 'border-start border-4 border-primary'}`}>
                        <div
                           className="card-header bg-transparent py-3 d-flex align-items-center gap-3 cursor-pointer border-0"
                           onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        >
                           <div className={`${item.urgent ? 'bg-danger' : 'bg-primary'} text-white rounded-3 shadow-sm d-flex align-items-center justify-content-center`} style={{ width: '42px', height: '42px' }}>
                              {item.urgent ? <AlertTriangle size={20} /> : <ClipboardCheck size={20} />}
                           </div>
                           <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-0">
                                 <h6 className="fw-bold text-dark m-0 text-sm">{item.patient}</h6>
                                 <span className={`badge bg-${STATUS_MAP[item.status].color} bg-opacity-10 text-${STATUS_MAP[item.status].color} text-[9px] uppercase px-2 py-1 border border-${STATUS_MAP[item.status].color} border-opacity-20 font-black`}>
                                    {STATUS_MAP[item.status].label}
                                 </span>
                                 {item.urgent && <span className="text-[10px] text-danger font-black uppercase animate-pulse ms-2">● Urgent Review</span>}
                              </div>
                              <div className="d-flex gap-3 text-[9px] text-muted font-bold uppercase mt-1 tracking-widest">
                                 <span>Type: {item.type}</span>
                                 <span>• {item.time}</span>
                                 <span className={item.burden > 70 ? 'text-danger fw-black' : 'text-primary'}>Matrix Burden: {item.burden}%</span>
                              </div>
                           </div>
                           <div className="text-muted">
                              {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                           </div>
                        </div>

                        {expandedId === item.id && (
                           <div className="card-body p-4 pt-0 border-top border-light animate-in fade-in slide-in-from-top-2">
                              <div className="row g-4 mt-2">
                                 <div className="col-md-8 border-end border-light pr-md-4">
                                    <div className="p-4 bg-light rounded-4 mb-4 border border-light shadow-inner">
                                       <div className="d-flex align-items-center gap-2 mb-2 text-dark">
                                          <Brain size={16} className="text-primary" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">AI Generated Findings</span>
                                       </div>
                                       <p className="text-xs font-bold text-dark mb-0 leading-relaxed italic">"Mechanistic load analysis indicates critical dysregulation in Axis A3.1 (Metabolic Flux) with a confidence index of 0.88. Clinical grounding required for insulin sensitivity calibration."</p>
                                    </div>

                                    <div className="d-flex gap-2">
                                       <button className="btn btn-success btn-sm px-4 font-bold uppercase tracking-widest text-[9px] shadow-sm d-flex align-items-center gap-2 py-2">
                                          <CheckCircle size={14} /> Approve Diagnostic
                                       </button>
                                       <button className="btn btn-outline-danger btn-sm px-4 font-bold uppercase tracking-widest text-[9px] shadow-sm d-flex align-items-center gap-2 py-2 bg-white">
                                          <XCircle size={14} /> Flag for Review
                                       </button>
                                       <button className="btn btn-light border btn-sm px-4 font-bold uppercase tracking-widest text-[9px] shadow-sm d-flex align-items-center gap-2 py-2 bg-white ms-auto">
                                          <Edit3 size={14} /> Edit Finding
                                       </button>
                                    </div>
                                 </div>
                                 <div className="col-md-4 pl-md-4 d-flex flex-column gap-3">
                                    <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 border shadow-xs">
                                       <div className="text-primary"><Shield size={20} /></div>
                                       <div>
                                          <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Protocol Trust</div>
                                          <div className="text-xs font-black text-dark tracking-tighter">Level 4 Certified</div>
                                       </div>
                                    </div>
                                    <div className="p-3 bg-white border rounded-3 d-flex align-items-center gap-3 shadow-xs">
                                       <div className="text-success"><ShieldCheck size={20} /></div>
                                       <div>
                                          <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Algorithmic Audit</div>
                                          <div className="text-xs font-black text-dark tracking-tighter">Verified Integrity</div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="mt-5 p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10 d-flex align-items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
               <ShieldCheck size={20} />
            </div>
            <div>
               <h6 className="fw-bold text-primary mb-1 text-sm uppercase tracking-widest">Institutional Decision Support Protocol</h6>
               <p className="text-[11px] text-muted mb-0">Physician validation is a critical requirement for institutional accountability. All AI-generated findings must be cross-verified against clinical expertise before being committed to the permanent patient record.</p>
            </div>
         </div>

         <style jsx>{`
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      `}</style>
      </div>
   );
}
