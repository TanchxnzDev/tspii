"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  ChevronRight,
  Camera,
  LogOut,
  Key,
  Smartphone,
  Mail,
  MapPin,
  QrCode,
  ArrowLeft,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function PatientSettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const menuItems = [
    { id: "profile", label: "โปรไฟล์ของฉัน", icon: User, color: "text-primary-custom", bg: "bg-primary-custom" },
    { id: "security", label: "ความปลอดภัย", icon: Lock, color: "text-warning", bg: "bg-warning" },
    { id: "notifications", label: "การแจ้งเตือน", icon: Bell, color: "text-info", bg: "bg-info" },
    { id: "privacy", label: "ความเป็นส่วนตัว", icon: Shield, color: "text-success", bg: "bg-success" },
  ];

  return (
    <div className="bg-secondary-custom min-vh-100 font-kanit pb-5 text-start">
      {/* Mini Header */}
      <div className="bg-white border-bottom px-3 py-3 d-flex align-items-center gap-3 shadow-xs sticky-top">
        <Link href="/patient/dashboard" className="text-muted"><ArrowLeft size={20} /></Link>
        <div>
          <h6 className="fw-bold mb-0">ตั้งค่าระบบ</h6>
          <p className="tiny text-muted mb-0">จัดการข้อมูลส่วนตัวและความปลอดภัย</p>
        </div>
      </div>

      <div className="container-fluid p-4">
        
        {/* Profile Card Summary */}
        <div className="bg-white rounded-5 p-4 shadow-sm border border-light mb-4">
           <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                 <div className="bg-primary-custom bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary-custom fw-bold h4 mb-0 shadow-xs" style={{ width: '64px', height: '64px' }}>
                    S
                 </div>
                 <button className="btn btn-white btn-sm rounded-circle shadow-sm position-absolute bottom-0 end-0 p-1 border">
                    <Camera size={12} className="text-muted" />
                 </button>
              </div>
              <div>
                 <h5 className="fw-bold text-dark mb-1">คุณสมชาย ใจดี</h5>
                 <p className="tiny text-muted mb-0">HN: TSPI-888 • อายุ 35 ปี</p>
                 <span className="tiny fw-bold text-success mt-1 d-inline-block">Verified Patient</span>
              </div>
           </div>
        </div>

        {/* Settings Grid */}
        <div className="row g-2 mb-4">
           {menuItems.map((item) => (
              <div key={item.id} className="col-6">
                 <div 
                    className={`p-3 rounded-5 border transition-all cursor-pointer h-100 ${activeSection === item.id ? 'bg-white border-primary-custom shadow-sm' : 'bg-white bg-opacity-50 border-light'}`}
                    onClick={() => setActiveSection(item.id)}
                 >
                    <div className={`${item.bg} bg-opacity-10 p-2 rounded-4 d-inline-flex mb-2 ${item.color}`}>
                       <item.icon size={18} />
                    </div>
                    <p className="tiny fw-bold text-dark mb-0">{item.label}</p>
                 </div>
              </div>
           ))}
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-5 p-4 shadow-sm border border-light">
           {activeSection === 'profile' && (
              <div className="animate-fade-in">
                 <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">ข้อมูลส่วนตัว</h6>
                 <div className="mb-3">
                    <label className="tiny fw-bold text-muted uppercase mb-2">เบอร์โทรศัพท์</label>
                    <div className="input-group">
                       <span className="input-group-text bg-light border-0 rounded-start-4"><Smartphone size={16} className="text-muted" /></span>
                       <input type="text" className="form-control bg-light border-0 rounded-end-4 py-2.5 small fw-bold" defaultValue="081-234-5678" />
                    </div>
                 </div>
                 <div className="mb-4">
                    <label className="tiny fw-bold text-muted uppercase mb-2">อีเมล</label>
                    <div className="input-group">
                       <span className="input-group-text bg-light border-0 rounded-start-4"><Mail size={16} className="text-muted" /></span>
                       <input type="email" className="form-control bg-light border-0 rounded-end-4 py-2.5 small fw-bold" defaultValue="somchai@example.com" />
                    </div>
                 </div>
                 <button className="btn btn-primary-custom rounded-pill w-100 py-3 fw-bold shadow-sm">บันทึกข้อมูล</button>
              </div>
           )}

           {activeSection === 'security' && (
              <div className="animate-fade-in">
                 <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">ความปลอดภัย</h6>
                 <div className="d-grid gap-2">
                    <div className="p-3 rounded-4 bg-light bg-opacity-30 border d-flex align-items-center justify-content-between">
                       <div className="d-flex align-items-center gap-3">
                          <Key size={18} className="text-warning" />
                          <div>
                             <p className="small fw-bold text-dark mb-0">เปลี่ยนรหัสผ่าน</p>
                             <p className="tiny text-muted mb-0">อัปเดตความปลอดภัยล่าสุด 3 เดือนที่แล้ว</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-muted" />
                    </div>
                    <div className="p-3 rounded-4 bg-light bg-opacity-30 border d-flex align-items-center justify-content-between">
                       <div className="d-flex align-items-center gap-3">
                          <QrCode size={18} className="text-primary-custom" />
                          <div>
                             <p className="small fw-bold text-dark mb-0">Two-Factor (2FA)</p>
                             <p className="tiny text-success mb-0">เปิดใช้งานแล้ว (Authenticator App)</p>
                          </div>
                       </div>
                       <CheckCircle size={16} className="text-success" />
                    </div>
                 </div>
                 <button className="btn btn-outline-danger border-0 rounded-pill w-100 py-3 fw-bold mt-4 d-flex align-items-center justify-content-center gap-2">
                    <LogOut size={18} /> ออกจากระบบ
                 </button>
              </div>
           )}

           {activeSection === 'notifications' && (
              <div className="animate-fade-in py-4 text-center">
                 <Bell size={48} className="text-muted opacity-20 mb-3" />
                 <p className="small text-muted mb-0">คุณมีการแจ้งเตือนใหม่ 0 รายการ</p>
              </div>
           )}

           {activeSection === 'privacy' && (
              <div className="animate-fade-in">
                 <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">ความเป็นส่วนตัว</h6>
                 <div className="bg-info bg-opacity-5 p-3 rounded-4 border border-info border-opacity-10 mb-4">
                    <div className="d-flex gap-2">
                       <Shield size={18} className="text-info shrink-0" />
                       <p className="tiny text-dark leading-relaxed mb-0">
                          ข้อมูลสุขภาพของคุณถูกจัดเก็บภายใต้มาตรฐานความปลอดภัยระดับสูง คุณสามารถขอถอนการเข้าถึงข้อมูลได้ทุกเมื่อครับ
                       </p>
                    </div>
                 </div>
                 <button className="btn btn-light rounded-pill w-100 py-2.5 tiny fw-bold text-muted border">อ่านนโยบายความเป็นส่วนตัว</button>
              </div>
           )}
        </div>

        {/* App Version Info */}
        <div className="mt-5 text-center opacity-30">
           <p className="tiny fw-bold mb-0">TSPI CLINICAL INTELLIGENCE</p>
           <p className="tiny mb-0">Version 2.0.4 (Stable)</p>
        </div>

      </div>

      <style jsx>{`
        .bg-primary-custom, .btn-primary-custom { background-color: var(--drpat-primary); color: white; }
        .text-primary-custom { color: var(--drpat-primary); }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .leading-relaxed { line-height: 1.6; }
        .transition-all { transition: all 0.3s ease; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
