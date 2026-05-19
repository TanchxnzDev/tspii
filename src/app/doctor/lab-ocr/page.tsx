"use client";

import { useState } from "react";
import {
   Microscope, Zap, Save, AlertTriangle, RefreshCw,
   Clock, Eye, Activity, Brain, FlaskConical,
   TrendingUp, FileText, Loader2, Upload, CheckCircle,
   AlertCircle, Info, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import "./../theme-inapp.css";

const PATTERN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
   liver_burden: { label: "Liver Burden", color: "text-warning", bg: "bg-warning" },
   insulin_resistance: { label: "Insulin Resistance", color: "text-warning", bg: "bg-warning" },
   inflammation: { label: "Inflammation", color: "text-danger", bg: "bg-danger" },
   oxidative_stress: { label: "Oxidative Stress", color: "text-primary", bg: "bg-primary" },
   kidney_burden: { label: "Kidney Burden", color: "text-primary", bg: "bg-primary" },
};

export default function LabOCRPage() {
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [ocrResult, setOcrResult] = useState<any>(null);
   const [patterns, setPatterns] = useState<any[]>([]);

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsAnalyzing(true);

      // Simulate OCR processing
      setTimeout(() => {
         setOcrResult({
            results: [
               { parameter: "ALT (SGPT)", value: "58", unit: "U/L", status: "High" },
               { parameter: "AST (SGOT)", value: "42", unit: "U/L", status: "High" },
               { parameter: "hs-CRP", value: "3.2", unit: "mg/L", status: "High" },
               { parameter: "HbA1c", value: "5.7", unit: "%", status: "Normal" },
            ]
         });
         setPatterns([
            { pattern_name: "liver_burden", description: "ตรวจพบค่าเอนไซม์ตับสูงกว่าเกณฑ์ บ่งชี้ภาวะตับต้องทำงานหนัก" },
            { pattern_name: "inflammation", description: "ค่า hs-CRP บ่งชี้ว่ามีการอักเสบระดับต่ำในระบบร่างกาย (Systemic Inflammation)" }
         ]);
         setIsAnalyzing(false);
      }, 2000);
   };

   return (
      <div className="pb-5">
         {/* 🧭 Header Section */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                     <Microscope size={24} />
                  </div>
                  Lab OCR Analysis
               </h1>
               <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Laboratory Digitization Hub</p>
            </div>
            <div className="d-flex gap-2">
               <label className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-3 shadow-sm d-flex align-items-center gap-1 cursor-pointer">
                  <Upload size={14} /> อัปโหลดผลแล็บ
                  <input type="file" className="d-none" accept="image/*" onChange={handleFileUpload} />
               </label>
            </div>
         </div>

         <div className="row g-4">
            {/* 🔬 Left Column: OCR Analysis Engine */}
            <div className="col-md-7">
               <div className="card border-0 shadow-sm bg-white rounded-4 overflow-hidden">
                  <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center">
                     <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0 d-flex align-items-center gap-2">
                        <Brain size={14} className="text-primary" /> Clinical Lab Analysis
                     </h3>
                  </div>
                  <div className="card-body p-0">
                     {isAnalyzing ? (
                        <div className="p-5 text-center">
                           <Loader2 size={48} className="text-primary animate-spin mb-3 mx-auto" />
                           <h5 className="font-bold text-dark">กำลังประมวลผล OCR...</h5>
                           <p className="text-xs text-muted">AI กำลังสกัดค่าแล็บและวิเคราะห์ความสัมพันธ์ของแกนชีววิทยา</p>
                        </div>
                     ) : ocrResult ? (
                        <div className="p-4">
                           <div className="table-responsive mb-4">
                              <table className="table table-sm table-striped table-hover text-sm">
                                 <thead>
                                    <tr className="bg-light">
                                       <th className="p-2 ps-3">Parameter</th>
                                       <th className="p-2">Value</th>
                                       <th className="p-2">Unit</th>
                                       <th className="p-2 text-end pe-3">Status</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {ocrResult.results.map((r: any, i: number) => (
                                       <tr key={i}>
                                          <td className="p-2 ps-3 font-bold">{r.parameter}</td>
                                          <td className="p-2 font-medium">{r.value}</td>
                                          <td className="p-2 text-muted text-xs">{r.unit}</td>
                                          <td className="p-2 text-end pe-3">
                                             <span className={`badge text-[9px] ${r.status === 'Normal' ? 'bg-success text-white' : 'bg-danger text-white'} px-2 py-1 font-bold`}>
                                                {r.status}
                                             </span>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>

                           <div className="mt-4">
                              <h6 className="text-xs font-bold text-muted uppercase mb-3 border-bottom pb-1">AI Pattern Recognition</h6>
                              <div className="d-flex flex-column gap-2">
                                 {patterns.map((p, i) => {
                                    const style = PATTERN_LABELS[p.pattern_name] || PATTERN_LABELS.liver_burden;
                                    return (
                                       <div key={i} className={`p-3 rounded-3 ${style.bg} bg-opacity-10 border-start border-4 border-${style.color === 'text-warning' ? 'warning' : style.color === 'text-danger' ? 'danger' : 'primary'}`}>
                                          <h6 className={`font-bold text-xs mb-1 ${style.color}`}>{style.label}</h6>
                                          <p className="text-[10px] text-dark mb-0">{p.description}</p>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>

                           <button className="btn btn-success w-100 mt-4 font-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-2">
                              <Save size={14} /> ยืนยันและบันทึกค่าแล็บลงประวัติคนไข้
                           </button>
                        </div>
                     ) : (
                        <div className="p-5 text-center text-muted border-2 border-dashed m-3 rounded-4">
                           <FileText size={48} className="mx-auto mb-3 opacity-30" />
                           <h5 className="font-bold text-dark">รอการอัปโหลดใบแล็บ</h5>
                           <p className="text-xs">กรุณาเลือกรูปภาพผลแล็บเพื่อเริ่มใช้งานระบบ AI OCR</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* ⏱️ Right Column: Pending & Recent List */}
            <div className="col-md-5">
               <div className="card border-0 shadow-sm bg-white rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center">
                     <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0 d-flex align-items-center gap-2">
                        <Clock size={14} className="text-warning" /> รายการรอตรวจสอบ
                     </h3>
                     <button className="btn btn-light btn-xs border"><RefreshCw size={12} /></button>
                  </div>
                  <div className="card-body p-0">
                     <div className="list-group list-group-flush">
                        {[
                           { name: "คุณสมชาย ใจดี", hn: "HN88291", date: "Today 10:20", abnormal: 3, conf: 0.94 },
                           { name: "คุณสมหญิง รักสุขภาพ", hn: "HN77210", date: "Today 09:15", abnormal: 1, conf: 0.88 }
                        ].map((item, i) => (
                           <div key={i} className="list-group-item border-bottom border-light px-4 py-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                 <div>
                                    <span className="font-bold text-sm text-dark d-block">{item.name}</span>
                                    <small className="text-muted text-[10px] uppercase font-bold">HN: {item.hn} • {item.date}</small>
                                 </div>
                                 <span className="badge bg-danger text-white text-[9px] font-bold">{item.abnormal} Alerts</span>
                              </div>
                              <div className="progress bg-light mb-2" style={{ height: '4px' }}>
                                 <div className="progress-bar bg-success" style={{ width: `${item.conf * 100}%` }}></div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                 <small className="text-[9px] text-muted font-bold">AI Confidence: {Math.round(item.conf * 100)}%</small>
                                 <div className="btn-group">
                                    <button className="btn btn-light btn-sm border px-2"><Eye size={12} /></button>
                                    <button className="btn btn-primary btn-sm border font-bold text-[9px] px-2">APPROVE</button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="card-footer bg-white border-top border-light text-center py-2">
                     <small className="text-muted italic text-[10px]">ผลแล็บที่อนุมัติแล้วจะถูกซิงค์เข้า Digital Twin อัตโนมัติ</small>
                  </div>
               </div>

               <div className="p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10 d-flex align-items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
                     <ShieldCheck size={20} />
                  </div>
                  <div>
                     <h6 className="fw-bold text-primary mb-1 text-[10px] uppercase tracking-widest">Data Integrity</h6>
                     <p className="text-[10px] text-muted mb-0">All lab results are encrypted and verified before being committed to the patient's permanent record.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
