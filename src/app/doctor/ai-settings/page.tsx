"use client";

import { useState } from "react";
import {
   Save, Brain, Zap, Bot, ShieldCheck, Clock,
   Sparkles, Database, Cpu, Shield, CheckCircle,
   AlertCircle, RefreshCw, Server, Lock, Activity,
   Settings2, Terminal, MessageSquare, Fingerprint,
   Loader2
} from "lucide-react";
import Link from "next/link";
import "./../theme-inapp.css";

export default function AISettingsPage() {
   const [isSaving, setIsSaving] = useState(false);
   const [settings, setSettings] = useState({
      ai_triage: true,
      ai_intake: true,
      provider: "gemini",
      model: "gemini-1.5-pro",
      system_prompt: "คุณคือผู้ช่วยอัจฉริยะประจำคลินิก TSPI ให้คำปรึกษาด้วยความสุภาพ มืออาชีพ และเน้นความปลอดภัยของคนไข้เป็นหลัก..."
   });

   const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1500);
   };

   return (
      <div className="pb-5">
         {/* 🧭 Header Section */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                     <Cpu size={24} />
                  </div>
                  AI Engine Configuration
               </h1>
               <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Advanced Neural Core & Clinical Logic Management</p>
            </div>
            <div className="d-flex gap-2">
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-4 shadow-sm d-flex align-items-center gap-2"
               >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Deploy Changes
               </button>
            </div>
         </div>

         <div className="row g-4">
            {/* 🤖 Left Column: Main Configuration */}
            <div className="col-lg-8">
               {/* Core Capabilities */}
               <div className="card border-0 shadow-sm bg-white mb-4 overflow-hidden rounded-4">
                  <div className="card-header bg-transparent border-bottom border-light py-3">
                     <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Core AI Capabilities</h3>
                  </div>
                  <div className="card-body p-0">
                     <div className="list-group list-group-flush">
                        {[
                           { id: 'ai_triage', title: 'AI Clinical Triage', desc: 'Analyzes symptom severity and prioritizes patient queues automatically.', icon: Zap, color: 'warning' },
                           { id: 'ai_intake', title: 'Autonomous Intake', desc: 'Robotic history taking and clinical data gathering via chat interface.', icon: Bot, color: 'info' },
                        ].map((f) => (
                           <div key={f.id} className="list-group-item border-light p-4 d-flex align-items-center justify-content-between transition-all hover:bg-light bg-opacity-30">
                              <div className="d-flex align-items-center gap-3">
                                 <div className={`bg-${f.color} bg-opacity-10 p-3 rounded-circle text-${f.color}`}>
                                    <f.icon size={20} />
                                 </div>
                                 <div>
                                    <span className="font-bold d-block text-dark text-sm mb-1">{f.title}</span>
                                    <p className="text-muted text-[11px] mb-0 font-medium">{f.desc}</p>
                                 </div>
                              </div>
                              <div className="form-check form-switch">
                                 <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={f.id}
                                    checked={settings[f.id as keyof typeof settings] as boolean}
                                    onChange={(e) => setSettings({ ...settings, [f.id]: e.target.checked })}
                                    style={{ width: '40px', height: '20px' }}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Model Settings */}
               <div className="card border-0 shadow-sm bg-white mb-4 overflow-hidden rounded-4">
                  <div className="card-header bg-transparent border-bottom border-light py-3 d-flex align-items-center gap-2">
                     <Server size={16} className="text-primary" />
                     <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Model & Provider Infrastructure</h3>
                  </div>
                  <div className="card-body p-4">
                     <div className="row g-4">
                        <div className="col-md-6">
                           <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">AI Intelligence Provider</label>
                           <select
                              className="form-select bg-light border-0 text-sm font-bold p-3"
                              value={settings.provider}
                              onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
                           >
                              <option value="gemini">Google Gemini AI (V-Twin Native)</option>
                              <option value="openai">OpenAI (GPT-4o Enterprise)</option>
                              <option value="anthropic">Anthropic (Claude-3 Opus)</option>
                           </select>
                        </div>
                        <div className="col-md-6">
                           <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Active Computing Model</label>
                           <select
                              className="form-select bg-light border-0 text-sm font-bold p-3"
                              value={settings.model}
                              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                           >
                              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Clinical Optimized)</option>
                              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast)</option>
                              <option value="gpt-4o">GPT-4o (Standard Reasoning)</option>
                           </select>
                        </div>
                        <div className="col-12 mt-4 pt-3 border-top border-light">
                           <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-flex justify-content-between">
                              <span>Primary System Protocol (Prompt)</span>
                              <span className="text-primary"><Terminal size={12} className="me-1" /> Clinical Syntax Active</span>
                           </label>
                           <textarea
                              className="form-control bg-dark text-white font-mono text-xs p-4 rounded-3 border-0"
                              rows={10}
                              value={settings.system_prompt}
                              onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                              placeholder="Initialize system protocol..."
                           />
                           <div className="mt-2 d-flex align-items-center gap-2">
                              <Sparkles size={12} className="text-warning" />
                              <small className="text-[10px] text-muted font-bold uppercase tracking-tighter">AI tokens are optimized for clinical reasoning and PDPA-compliant data masking.</small>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 🏛️ Right Column: Stats & Diagnostics */}
            <div className="col-lg-4">
               <div className="card border-0 shadow-sm bg-dark text-white rounded-4 overflow-hidden mb-4 shadow-lg">
                  <div className="card-header bg-[#121212] border-bottom border-white border-opacity-10 py-3">
                     <h3 className="card-title text-[10px] font-bold uppercase text-white mb-0 tracking-widest">Engine Diagnostics</h3>
                  </div>
                  <div className="card-body p-4 bg-[#0a0a0a]">
                     <div className="d-flex flex-column gap-4">
                        <div className="d-flex align-items-center justify-content-between">
                           <div className="d-flex align-items-center gap-2">
                              <Activity size={16} className="text-success" />
                              <span className="text-xs font-bold uppercase tracking-tighter text-gray-400">Response Latency</span>
                           </div>
                           <span className="text-xs font-black text-white">42ms</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                           <div className="d-flex align-items-center gap-2">
                              <Database size={16} className="text-primary" />
                              <span className="text-xs font-bold uppercase tracking-tighter text-gray-400">Token Efficiency</span>
                           </div>
                           <span className="text-xs font-black text-white">98.2%</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                           <div className="d-flex align-items-center gap-2">
                              <ShieldCheck size={16} className="text-info" />
                              <span className="text-xs font-bold uppercase tracking-tighter text-gray-400">Hallucination Index</span>
                           </div>
                           <span className="text-xs font-black text-success">LOW (0.01)</span>
                        </div>
                     </div>

                     <div className="mt-5 pt-4 border-top border-white border-opacity-10">
                        <button className="btn btn-outline-light btn-sm w-100 font-bold uppercase tracking-widest text-[9px] py-2 border-opacity-20 d-flex align-items-center justify-content-center gap-2">
                           <RefreshCw size={12} /> Re-calibrate Neural Weights
                        </button>
                     </div>
                  </div>
               </div>

               <div className="card border-0 shadow-sm bg-white rounded-4 overflow-hidden">
                  <div className="card-header bg-transparent border-bottom border-light py-3">
                     <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Security Handshake</h3>
                  </div>
                  <div className="card-body p-4">
                     <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 mb-3 border">
                        <div className="text-primary"><Lock size={20} /></div>
                        <div>
                           <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Encryption Layer</div>
                           <div className="text-xs font-black text-dark">AES-256 GCM Active</div>
                        </div>
                     </div>
                     <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 border">
                        <div className="text-success"><Fingerprint size={20} /></div>
                        <div>
                           <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Model Identity</div>
                           <div className="text-xs font-black text-dark">Verified Institutional Hub</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
