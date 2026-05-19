"use client";

import { useState, useEffect } from "react";
import {
   Activity,
   Calendar,
   Clock,
   Info,
   Moon,
   Scale,
   User as UserIcon,
   AlertCircle,
   ClipboardList,
   Bot,
   ChevronRight,
   Heart,
   Droplet,
   Thermometer,
   Shield,
   Sparkles,
   Bell,
   FileText,
   MessageSquare,
   Zap,
   History,
   Loader2
} from "lucide-react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/client";

export default function PatientDashboard() {
   const [greeting, setGreeting] = useState("สวัสดีตอนเช้า");
   const [patient, setPatient] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("สวัสดีตอนเช้า");
      else if (hour < 18) setGreeting("สวัสดีตอนบ่าย");
      else setGreeting("สวัสดีตอนเย็น");

      const auth = getAuth();
      const unsub = onAuthStateChanged(auth, async (user) => {
         if (user) {
            try {
               const docRef = doc(db, "patients", user.uid);
               const docSnap = await getDoc(docRef);
               if (docSnap.exists()) {
                  setPatient({ id: docSnap.id, ...docSnap.data() });
               } else {
                  // Try querying by email
                  const { query, where, collection, getDocs } = await import("firebase/firestore");
                  const q = query(collection(db, "patients"), where("email", "==", user.email));
                  const snap = await getDocs(q);
                  if (!snap.empty) {
                     setPatient({ id: snap.docs[0].id, ...snap.docs[0].data() });
                  }
               }
            } catch (err) {
               console.error("Error loading patient data:", err);
            }
         }
         setLoading(false);
      });
      return () => unsub();
   }, []);

   const healthStats = patient ? [
      { label: "BMI Score", value: patient.bmi || "24.2", unit: "kg/m²", status: "ปกติ", color: "text-success" },
      { label: "น้ำหนักล่าสุด", value: patient.weight || "68.5", unit: "kg", status: "-0.5 kg", color: "text-primary-custom" },
   ] : [
      { label: "BMI Score", value: "-", unit: "kg/m²", status: "รอข้อมูล", color: "text-muted" },
      { label: "น้ำหนักล่าสุด", value: "-", unit: "kg", status: "รอข้อมูล", color: "text-muted" },
   ];

   return (
      <div className="bg-secondary-custom min-vh-100 font-kanit pb-5">
         <div className="container-fluid p-4">

            {/* Welcome Section */}
            <div className="mb-4 text-start">
               {loading ? (
                  <div className="d-flex align-items-center gap-2">
                     <Loader2 size={16} className="animate-spin text-primary-custom" />
                     <p className="tiny text-muted mb-0">กำลังโหลดข้อมูล...</p>
                  </div>
               ) : (
                  <>
                     <p className="tiny text-muted mb-0">{greeting}</p>
                     <h4 className="fw-bold text-dark mb-0">{patient?.fname || patient?.name || "ผู้ใช้"} {patient?.lname || ""}</h4>
                     <span className="tiny fw-bold text-primary-custom bg-white px-2 py-1 rounded-pill shadow-xs mt-2 d-inline-block border">Member ID: {patient?.hn || patient?.id?.slice(0, 8).toUpperCase() || "TSPI-888"}</span>
                  </>
               )}
            </div>

            {/* AI Assistant Hero Card */}
            <div className="bg-dark rounded-5 p-4 text-white shadow-lg mb-4 position-relative overflow-hidden">
               <div className="position-absolute top-0 end-0 p-3 opacity-10">
                  <Bot size={120} />
               </div>
               <div className="position-relative z-1 text-start">
                  <div className="d-flex align-items-center gap-2 mb-3">
                     <div className="bg-primary-custom p-2 rounded-3">
                        <Sparkles size={18} className="text-white" />
                     </div>
                     <span className="tiny fw-bold text-white text-uppercase tracking-widest">AI Health Assistant</span>
                  </div>
                  <h5 className="fw-bold mb-2">วันนี้คุณรู้สึกอย่างไรบ้าง?</h5>
                  <p className="small text-white text-opacity-70 mb-4 leading-relaxed">
                     แจ้งอาการหรือปรึกษาปัญหาเบื้องต้นกับ AI ของเรา <br />
                     เพื่อให้คุณหมอวิเคราะห์ได้แม่นยำขึ้นครับ
                  </p>
                  <Link href="/patient/ai-intake" className="btn btn-primary-custom rounded-pill px-4 py-2 fw-bold small d-inline-flex align-items-center gap-2 shadow-sm">
                     คุยกับ AI เลย <ChevronRight size={16} />
                  </Link>
               </div>
            </div>

            {/* Quick Vitals Row */}
            <div className="row g-3 mb-4">
               {healthStats.map((s, i) => (
                  <div key={i} className="col-6">
                     <div className="bg-white rounded-5 p-3 shadow-sm border border-light text-start h-100">
                        <p className="tiny fw-bold text-muted uppercase mb-1">{s.label}</p>
                        <h3 className="fw-bold text-dark mb-1">{s.value} <span className="tiny fw-normal text-muted">{s.unit}</span></h3>
                        <span className={`tiny fw-bold ${s.color}`}>{s.status}</span>
                     </div>
                  </div>
               ))}
            </div>

            {/* Detailed Vitals Grid */}
            <div className="bg-white rounded-5 p-4 shadow-sm border border-light mb-4 text-start">
               <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                     <Activity size={18} className="text-danger" /> สัญญาณชีพล่าสุด
                  </h6>
                  <span className="tiny text-muted">อัปเดต: 2 ชม.ที่แล้ว</span>
               </div>
               <div className="row g-4">
                  {[
                     { label: "ชีพจร", value: "72", unit: "bpm", icon: Heart, color: "text-danger", bg: "bg-danger" },
                     { label: "ความดัน", value: "120/80", unit: "mmHg", icon: Droplet, color: "text-primary-custom", bg: "bg-primary-custom" },
                     { label: "อุณหภูมิ", value: "36.5", unit: "°C", icon: Thermometer, color: "text-warning", bg: "bg-warning" },
                  ].map((v, i) => (
                     <div key={i} className="col-4 text-center">
                        <div className={`${v.bg} bg-opacity-10 p-2 rounded-circle d-inline-flex align-items-center justify-content-center mb-2`} style={{ width: '40px', height: '40px' }}>
                           <v.icon size={18} className={v.color} />
                        </div>
                        <p className="small fw-bold text-dark mb-0">{v.value}</p>
                        <p className="tiny text-muted mb-0">{v.label}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Action Menu */}
            <div className="row g-3 mb-4">
               {[
                  { title: "นัดหมายแพทย์", icon: Calendar, color: "text-info", bg: "bg-info", href: "/patient/appointments" },
                  { title: "ประวัติการรักษา", icon: History, color: "text-purple", bg: "bg-purple", href: "/patient/history" },
                  { title: "ดูผลตรวจแล็บ", icon: FileText, color: "text-success", bg: "bg-success", href: "/patient/download" },
                  { title: "ใบยินยอมรับบริการ", icon: Shield, color: "text-muted", bg: "bg-light", href: "/patient/consent" },
               ].map((m, i) => (
                  <div key={i} className="col-6 col-md-3 text-start">
                     <Link href={m.href} className="text-decoration-none">
                        <div className="bg-white rounded-5 p-3 shadow-sm border border-light h-100 hover-shadow transition">
                           <div className={`${m.bg} bg-opacity-10 p-2 rounded-4 d-inline-flex align-items-center justify-content-center mb-3 ${m.color}`}>
                              <m.icon size={20} />
                           </div>
                           <h6 className="small fw-bold text-dark mb-0">{m.title}</h6>
                        </div>
                     </Link>
                  </div>
               ))}
            </div>

            {/* Health Tips Section */}
            <div className="bg-primary-custom bg-opacity-10 rounded-5 p-4 border border-primary-custom border-opacity-10 text-start">
               <div className="d-flex align-items-start gap-3">
                  <div className="bg-white p-2 rounded-4 shadow-sm text-primary-custom">
                     <Zap size={20} />
                  </div>
                  <div>
                     <h6 className="fw-bold text-dark mb-1">เคล็ดลับสุขภาพประจำวัน</h6>
                     <p className="tiny text-dark text-opacity-70 leading-relaxed mb-0">
                        ดื่มน้ำอย่างน้อยวันละ 8 แก้ว และพยายามเดินให้ได้ 5,000 ก้าวในวันนี้ เพื่อช่วยระบบเผาผลาญครับ
                     </p>
                  </div>
               </div>
            </div>

         </div>

         <style jsx>{`
        .bg-primary-custom, .btn-primary-custom { background-color: var(--drpat-primary); color: white; }
        .text-primary-custom { color: var(--drpat-primary); }
        .bg-purple { background-color: #a855f7; }
        .text-purple { color: #a855f7; }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .leading-relaxed { line-height: 1.6; }
        .hover-shadow:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .transition { transition: all 0.3s ease; }
      `}</style>
      </div>
   );
}
