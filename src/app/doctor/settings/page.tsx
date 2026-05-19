"use client";

import { useState } from "react";
import {
   Settings, User, Building2, Bell, ShieldCheck,
   Globe, Save, Database, Shield, Key, Plus,
   Mail, Phone, MapPin, Camera, Smartphone,
   Lock, Globe2, Link2, SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import "./../theme-inapp.css";

export default function DoctorSettingsPage() {
   const [activeTab, setActiveTab] = useState("profile");

   const tabs = [
      { id: "profile", label: "Physician Profile", icon: User },
      { id: "clinic", label: "Clinic Information", icon: Building2 },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "security", label: "Access & Security", icon: ShieldCheck },
      { id: "api", label: "API Connectivity", icon: Link2 },
   ];

   return (
      <div className="pb-5">
         {/* 🧭 Settings Header */}
         <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
               <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                     <Settings size={24} />
                  </div>
                  Settings & Configuration
               </h1>
               <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">System Control Panel & Personal Preferences</p>
            </div>
            <div className="d-flex gap-2">
               <button className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-4 shadow-sm d-flex align-items-center gap-2">
                  <Save size={14} /> Commit Changes
               </button>
            </div>
         </div>

         <div className="row g-4">
            {/* 🛠️ Left Column: Navigation Sidebar */}
            <div className="col-lg-3">
               <div className="card border-0 shadow-sm bg-white overflow-hidden mb-4">
                  <div className="card-header bg-transparent border-bottom border-light py-3">
                     <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Configuration Menu</h3>
                  </div>
                  <div className="list-group list-group-flush">
                     {tabs.map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                        >
                           <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-primary opacity-50'} />
                           <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10">
                  <div className="d-flex align-items-center gap-2 mb-2">
                     <ShieldCheck size={16} className="text-primary" />
                     <h6 className="text-[10px] font-bold text-primary uppercase mb-0 tracking-widest">Data Trust</h6>
                  </div>
                  <p className="text-[10px] text-muted mb-0 leading-relaxed">
                     All configurations are encrypted and stored in compliance with international clinical data security standards. Multi-factor authentication is required for critical changes.
                  </p>
               </div>
            </div>

            {/* 📄 Right Column: Content Area */}
            <div className="col-lg-9">
               <div className="card border-0 shadow-sm bg-white min-h-[600px] overflow-hidden">
                  <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center">
                     <h3 className="card-title text-xs font-bold uppercase text-dark mb-0 tracking-wider">
                        {tabs.find(t => t.id === activeTab)?.label}
                     </h3>
                     <div className="text-[9px] font-bold text-muted uppercase tracking-tighter">System ID: CONFIG-8820-TSPI</div>
                  </div>
                  <div className="card-body p-4">

                     {activeTab === 'profile' && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                           <div className="row mb-5">
                              <div className="col-md-4 text-center mb-4 mb-md-0 d-flex flex-column align-items-center justify-content-center border-end border-light">
                                 <div className="position-relative">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted border border-2 border-white shadow-sm" style={{ width: '130px', height: '130px' }}>
                                       <User size={64} className="opacity-20" />
                                    </div>
                                    <button className="btn btn-sm btn-primary rounded-circle position-absolute shadow-lg d-flex align-items-center justify-content-center" style={{ bottom: '5px', right: '5px', width: '36px', height: '36px' }}>
                                       <Camera size={18} />
                                    </button>
                                 </div>
                                 <h5 className="mt-3 fw-bold text-dark mb-1">Dr. Phat Jitdee</h5>
                                 <span className="badge bg-primary bg-opacity-10 text-primary text-[9px] uppercase font-black px-3 py-1">Senior Physician</span>
                                 <p className="text-[10px] text-muted mt-2 uppercase font-bold tracking-widest">DR-8820-Verified</p>
                              </div>
                              <div className="col-md-8 px-md-5">
                                 <div className="row g-4">
                                    <div className="col-md-6">
                                       <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Full Name / Clinical Alias</label>
                                       <input type="text" className="form-control bg-light border-0 text-sm font-bold p-3" defaultValue="Dr. Phat Jitdee" />
                                    </div>
                                    <div className="col-md-6">
                                       <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Specialization</label>
                                       <input type="text" className="form-control bg-light border-0 text-sm font-bold p-3" defaultValue="Mechanistic Precision Medicine" />
                                    </div>
                                    <div className="col-md-6">
                                       <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Email Address</label>
                                       <input type="email" className="form-control bg-light border-0 text-sm font-bold p-3" defaultValue="phat.j@tspi.org" />
                                    </div>
                                    <div className="col-md-6">
                                       <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Contact Phone</label>
                                       <input type="text" className="form-control bg-light border-0 text-sm font-bold p-3" defaultValue="+66 81-882-0000" />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="border-top border-light pt-4">
                              <h6 className="text-xs font-bold text-dark uppercase tracking-widest mb-3">Institutional Credentials</h6>
                              <div className="row g-3">
                                 <div className="col-md-6">
                                    <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                                       <div className="text-primary"><Shield size={20} /></div>
                                       <div>
                                          <div className="text-[9px] font-bold text-muted uppercase tracking-widest">License Verification</div>
                                          <div className="text-xs font-bold text-dark">L-99881122 (Active)</div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="col-md-6">
                                    <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                                       <div className="text-success"><Database size={20} /></div>
                                       <div>
                                          <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Storage Quota</div>
                                          <div className="text-xs font-bold text-dark">4.2 GB / 10 GB Used</div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'clinic' && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                           <div className="row g-4 mb-5">
                              <div className="col-md-6">
                                 <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Clinic Name</label>
                                 <input type="text" className="form-control bg-light border-0 text-sm font-bold p-3" defaultValue="TSPI Precision Hub" />
                              </div>
                              <div className="col-md-6">
                                 <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Location ID</label>
                                 <input type="text" className="form-control bg-light border-0 text-sm font-bold p-3" defaultValue="HUB-TH-001" />
                              </div>
                              <div className="col-12">
                                 <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 d-block">Physical Address</label>
                                 <textarea className="form-control bg-light border-0 text-sm font-bold p-3" rows={3} defaultValue="123 Sukhumvit Road, Bangkok, Thailand 10110" />
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab !== 'profile' && activeTab !== 'clinic' && (
                        <div className="h-100 d-flex align-items-center justify-content-center text-center opacity-30 py-5">
                           <div>
                              <SlidersHorizontal size={48} className="mb-3 mx-auto" />
                              <h5 className="fw-bold uppercase tracking-widest">Module Under Activation</h5>
                              <p className="text-xs">Advanced configuration for this section is currently being provisioned.</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
