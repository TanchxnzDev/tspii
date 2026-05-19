"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  Zap,
  Sparkles
} from "lucide-react";
import { db, auth } from "@/utils/firebase/client";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function SmartAppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, "doctors"));
        setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Fetch doctors error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleFetchSmartSlots = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setLoading(true);
    try {
      // 🧠 Fetch AI Recommended Slots
      const response = await fetch("/api/ai/scheduler", {
        method: "POST",
        body: JSON.stringify({
          patientId: auth.currentUser?.uid,
          symptoms: symptoms || "General checkup",
          preferredDate: new Date().toISOString().split('T')[0]
        })
      });
      const data = await response.json();
      setAiAnalysis(data.analysis);
      setAvailableSlots(data.slots || []);
    } catch (err) {
      console.error("Fetch smart slots error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    const user = auth.currentUser;
    if (!user || !selectedDoctor || !selectedSlot) return;

    setBooking(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        patientName: user.displayName || "คนไข้ทั่วไป",
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.displayName,
        time: selectedSlot,
        date: new Date().toISOString().split('T')[0],
        symptoms: symptoms,
        urgencyScore: aiAnalysis?.urgencyScore || 0,
        expectedDuration: aiAnalysis?.recommendedDuration || 30,
        status: "confirmed",
        createdAt: serverTimestamp()
      });
      router.push("/patient/dashboard");
    } catch (err) {
      alert("จองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setBooking(false);
    }
  };

  if (loading && doctors.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8DE]">
      <Loader2 className="animate-spin text-primary-custom" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF8DE] font-kanit pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/patient/dashboard" className="text-slate-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-slate-900">นัดหมายอัจฉริยะ</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6 text-start">
        
        {/* Step 1: Input Symptoms */}
        {!selectedDoctor && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Sparkles className="text-primary-custom" size={20} />
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-0">บอกเล่าอาการเบื้องต้น</h2>
            </div>
            <textarea 
              className="form-control rounded-4 bg-light border-0 py-3 px-4 text-dark small shadow-none mb-4"
              rows={3}
              placeholder="เช่น มีอาการปวดหลังมา 2 วัน..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></textarea>
            
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">เลือกแพทย์ผู้เชี่ยวชาญ</h2>
            <div className="grid grid-cols-1 gap-3">
              {doctors.map(doc => (
                <button 
                  key={doc.id}
                  onClick={() => handleFetchSmartSlots(doc)}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-primary-custom transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary-custom bg-opacity-10 flex items-center justify-center text-primary-custom font-bold">
                    {doc.displayName?.charAt(0)}
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-slate-800 mb-0">{doc.displayName}</p>
                    <p className="tiny text-slate-400 mb-0">{doc.specialty || "แพทย์อายุรกรรม"}</p>
                  </div>
                  <ChevronRight size={18} className="ml-auto text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: AI Recommendations & Slots */}
        {selectedDoctor && !loading && (
          <div className="space-y-6">
            {aiAnalysis && (
              <div className="bg-dark rounded-5 p-5 text-white shadow-xl position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 p-4 opacity-10">
                  <Zap size={80} className="text-primary-custom" />
                </div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Zap size={18} className="text-primary-custom" />
                  <span className="tiny fw-bold text-primary-custom uppercase tracking-widest">AI Insights</span>
                </div>
                <p className="small mb-4 opacity-80">{aiAnalysis.reasoning}</p>
                <div className="d-flex gap-4">
                  <div>
                    <p className="tiny fw-bold text-white opacity-40 uppercase mb-1">ความเร่งด่วน</p>
                    <p className="h4 fw-bold mb-0">{aiAnalysis.urgencyScore}/10</p>
                  </div>
                  <div className="border-start border-white border-opacity-10 ps-4">
                    <p className="tiny fw-bold text-white opacity-40 uppercase mb-1">ระยะเวลา</p>
                    <p className="h4 fw-bold mb-0">{aiAnalysis.recommendedDuration} นาที</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">เลือกเวลาตรวจ</h2>
                <button onClick={() => {setSelectedDoctor(null); setAiAnalysis(null);}} className="text-xs text-primary-custom font-bold">เปลี่ยนแพทย์</button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {availableSlots.map(slot => (
                  <button 
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`p-4 rounded-3xl border transition-all text-start d-flex align-items-center justify-content-between ${
                      selectedSlot === slot.time 
                      ? 'bg-primary-custom border-primary-custom text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="font-bold mb-0">{slot.time} น.</p>
                      {slot.status === 'recommended' && <p className={`tiny mb-0 ${selectedSlot === slot.time ? 'text-white text-opacity-80' : 'text-primary-custom'}`}>{slot.reason}</p>}
                    </div>
                    {slot.status === 'recommended' && <Zap size={16} className={selectedSlot === slot.time ? 'text-white' : 'text-primary-custom'} />}
                  </button>
                ))}
              </div>
            </div>

            {selectedSlot && (
              <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto">
                <button 
                  onClick={handleBook}
                  disabled={booking}
                  className="w-100 btn btn-drpat-primary rounded-pill py-3.5 fw-bold shadow-xl d-flex align-items-center justify-content-center gap-2"
                >
                  {booking ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  ยืนยันนัดหมายเวลา {selectedSlot}
                </button>
              </div>
            )}
          </div>
        )}

        {loading && selectedDoctor && (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-primary-custom mx-auto mb-4" size={48} />
            <p className="fw-bold text-slate-500 animate-pulse">AI กำลังวิเคราะห์ช่วงเวลาที่เหมาะสม...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn-drpat-primary { 
          background: linear-gradient(135deg, #FF7444 0%, #FF9D7E 100%); 
          color: white; 
          border: none;
        }
        .text-primary-custom { color: #FF7444; }
        .bg-primary-custom { background-color: #FF7444; }
      `}</style>
    </div>
  );
}

