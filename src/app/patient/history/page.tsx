"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  Filter,
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  ChevronRight,
  Download,
  Database,
  Microscope,
  Zap,
  Shield,
  Layers,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  Smartphone,
  Mail,
  Share2,
  FileJson
} from "lucide-react";

export default function MedicalHistoryPage() {
  const [activeTab, setActiveTab] = useState<"history" | "download">("history");

  const historyItems = [
    { id: 1, type: "AI Assessment", date: "12 พ.ค. 2024", time: "09:30", content: "ซักประวัติอาการปวดท้องเบื้องต้น", icon: BrainIcon },
    { id: 2, type: "Lab Result", date: "10 พ.ค. 2024", time: "14:20", content: "ผลตรวจเลือดประจำปี (Annual Checkup)", icon: Microscope },
    { id: 3, type: "Doctor Visit", date: "05 พ.ค. 2024", time: "10:00", content: "ปรึกษาเรื่องภูมิแพ้ทางเดินหายใจ", icon: Activity },
  ];

  return (
    <div className="bg-secondary-custom min-vh-100 font-kanit pb-5">
      {/* Mini Header */}
      <div className="bg-white border-bottom px-3 py-3 d-flex align-items-center gap-3 shadow-xs sticky-top">
        <Link href="/patient/dashboard" className="text-muted"><ArrowLeft size={20} /></Link>
        <div>
          <h6 className="fw-bold mb-0">ข้อมูลสุขภาพ</h6>
          <p className="tiny text-muted mb-0">ประวัติการรักษาและดาวน์โหลดเอกสาร</p>
        </div>
      </div>

      <div className="container-fluid p-4">
        {/* Tab Switcher */}
        <div className="bg-white rounded-pill p-1 shadow-sm border border-light d-flex mb-4">
           <button 
              onClick={() => setActiveTab("history")}
              className={`flex-grow-1 py-2 rounded-pill border-0 tiny fw-bold transition-all ${activeTab === 'history' ? 'bg-primary-custom text-white shadow-sm' : 'bg-transparent text-muted'}`}
           >
              ประวัติการรักษา
           </button>
           <button 
              onClick={() => setActiveTab("download")}
              className={`flex-grow-1 py-2 rounded-pill border-0 tiny fw-bold transition-all ${activeTab === 'download' ? 'bg-primary-custom text-white shadow-sm' : 'bg-transparent text-muted'}`}
           >
              ศูนย์ดาวน์โหลด
           </button>
        </div>

        {activeTab === 'history' ? (
           <div className="text-start animate-fade-in">
              <div className="position-relative mb-4">
                 <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                 <input type="text" className="form-control rounded-pill ps-5 bg-white border-light shadow-sm py-2.5 tiny fw-bold" placeholder="ค้นหาประวัติการรักษา..." />
              </div>

              <div className="d-grid gap-3">
                 {historyItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-5 p-3 shadow-sm border border-light d-flex align-items-center gap-3 hover-shadow transition cursor-pointer">
                       <div className="bg-primary-custom bg-opacity-10 p-2.5 rounded-4 text-primary-custom">
                          <item.icon size={20} />
                       </div>
                       <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center gap-2 mb-1">
                             <span className="tiny fw-bold text-muted uppercase tracking-tighter">{item.date} • {item.time}</span>
                          </div>
                          <h6 className="small fw-bold text-dark mb-1 text-truncate">{item.content}</h6>
                          <p className="tiny text-primary-custom fw-bold mb-0 uppercase tracking-widest">{item.type}</p>
                       </div>
                       <ChevronRight size={18} className="text-muted opacity-30" />
                    </div>
                 ))}
              </div>
           </div>
        ) : (
           <div className="text-start animate-fade-in">
              <div className="bg-white rounded-5 p-4 shadow-sm border border-light mb-4">
                 <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Layers size={18} className="text-primary-custom" /> เลือกข้อมูลที่ต้องการ
                 </h6>
                 <div className="row g-2">
                    {[
                       { title: "เวชระเบียน", icon: Database, color: "text-info" },
                       { title: "ผลตรวจ Lab", icon: Microscope, color: "text-primary-custom" },
                       { title: "ประวัติยา", icon: Shield, color: "text-success" },
                       { title: "สรุปผล AI", icon: Zap, color: "text-warning" },
                    ].map((c, i) => (
                       <div key={i} className="col-6">
                          <div className="p-3 border rounded-4 bg-light bg-opacity-30 h-100 cursor-pointer hover-border-primary transition">
                             <div className={`${c.color} mb-2`}><c.icon size={24} /></div>
                             <p className="tiny fw-bold text-dark mb-0">{c.title}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-5 p-4 shadow-sm border border-light mb-4">
                 <h6 className="fw-bold text-dark mb-3">ตั้งค่าการดาวน์โหลด</h6>
                 <div className="mb-3">
                    <p className="tiny fw-bold text-muted uppercase mb-2">รูปแบบไฟล์</p>
                    <div className="d-flex gap-2">
                       <button className="btn btn-light rounded-pill px-3 py-2 tiny fw-bold flex-grow-1 border">PDF Document</button>
                       <button className="btn btn-light rounded-pill px-3 py-2 tiny fw-bold flex-grow-1 border">JSON Data</button>
                    </div>
                 </div>
                 <button className="btn btn-primary-custom rounded-pill w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
                    <Download size={18} /> ดาวน์โหลดข้อมูล (Secure)
                 </button>
              </div>

              <div className="bg-dark rounded-5 p-4 text-center shadow-lg">
                 <Lock size={24} className="text-primary-custom mb-2" />
                 <p className="tiny text-white text-opacity-50 mb-0">
                    ข้อมูลของคุณถูกเข้ารหัสด้วยมาตรฐานความปลอดภัยระดับสถาบันการเงิน (AES-256)
                 </p>
              </div>
           </div>
        )}
      </div>

      <style jsx>{`
        .bg-primary-custom, .btn-primary-custom { background-color: var(--drpat-primary); color: white; }
        .text-primary-custom { color: var(--drpat-primary); }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .hover-shadow:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .hover-border-primary:hover { border-color: var(--drpat-primary) !important; }
        .transition { transition: all 0.3s ease; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const BrainIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 014.44-2.04zM14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-4.44-2.04z" />
  </svg>
);
