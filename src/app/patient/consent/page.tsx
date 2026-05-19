"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Info
} from "lucide-react";
import { auth, db } from "@/utils/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { recordConsent } from "@/utils/firebase/compliance";

export default function PDPAConsentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<any>(null);
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const snap = await getDoc(doc(db, "consents", "v1.0"));
        if (snap.exists()) {
          const data = snap.data();
          setPolicy(data);
          // Default all required to true, others to false
          const initialChoices: Record<string, boolean> = {};
          data.policies.forEach((p: any) => {
            initialChoices[p.id] = p.required;
          });
          setChoices(initialChoices);
        }
      } catch (err) {
        console.error("Policy fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Get IP Address (Mock for now, can use external service)
      const ip = "127.0.0.1"; 
      await recordConsent(user.uid, choices, ip);
      router.push("/patient/dashboard");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary-custom" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-kanit flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={120} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-custom rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Lock size={32} />
            </div>
            <h1 className="text-xl font-bold mb-1">ความยินยอมในการเก็บข้อมูล</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest">PDPA Compliance v{policy?.version}</p>
          </div>
        </div>

        {/* Policy Items */}
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[13px] text-blue-800 leading-relaxed">
              เพื่อให้การรักษาด้วยระบบ AI และ 39 Biological Axes เป็นไปอย่างแม่นยำ 
              โปรดตรวจสอบและให้ความยินยอมในหัวข้อดังต่อไปนี้
            </p>
          </div>

          <div className="space-y-3">
            {policy?.policies.map((p: any) => (
              <label 
                key={p.id} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${choices[p.id] ? 'bg-slate-50 border-primary-custom' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex-grow pr-4">
                  <p className="text-sm font-bold text-slate-800">{p.label}</p>
                  {p.required && <span className="text-[10px] text-primary-custom font-bold uppercase">* จำเป็นต้องยินยอม</span>}
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-primary-custom"
                  checked={choices[p.id]}
                  disabled={p.required}
                  onChange={(e) => setChoices({...choices, [p.id]: e.target.checked})}
                />
              </label>
            ))}
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-100 btn btn-drpat-primary rounded-pill py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              ยืนยันความยินยอม
            </button>
            <p className="text-center text-[11px] text-slate-400">
              การกดยืนยันแสดงว่าคุณยอมรับ <span className="underline">นโยบายความเป็นส่วนตัว</span> ของเรา
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-drpat-primary { background-color: var(--drpat-primary); color: white; }
      `}</style>
    </div>
  );
}
