"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  MessageCircle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Mail,
  Lock,
  Loader2,
  ShieldAlert
} from "lucide-react";

export default function PatientLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/patient/dashboard");
    } catch (err: any) {
      setError(err.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    // LINE Login ใช้จากหน้าแรก (/) แทน
    router.push("/");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-secondary-custom p-3 font-kanit">
      <div className="bg-white rounded-5 shadow-lg p-4 p-md-5 w-100 animate-fade-in text-center" style={{ maxWidth: '450px' }}>

        <div className="d-flex justify-content-start mb-4">
          <Link href="/" className="btn btn-light rounded-circle p-2 shadow-sm">
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-circle shadow-sm mx-auto mb-4" style={{ width: '80px', height: '80px', border: '4px solid var(--drpat-card)' }}>
          <img src="/logo_tspi.jpg" alt="TSPI Logo" className="w-100 h-100 object-fit-cover" />
        </div>

        <h3 className="fw-bold text-dark mb-2">เข้าสู่ระบบคนไข้</h3>
        <p className="text-muted small mb-4 px-3">TSPI Clinical Intelligence System</p>

        {error && (
          <div className="mb-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-4 text-danger tiny fw-bold d-flex align-items-center gap-2 justify-content-center">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="text-start mb-4">
          <div className="mb-3">
            <label className="tiny fw-bold text-muted text-uppercase mb-2 d-block tracking-wider">อีเมล</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3"><Mail size={18} className="text-muted" /></span>
              <input
                type="email"
                className="form-control bg-light border-0 py-3 small"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="tiny fw-bold text-muted text-uppercase mb-2 d-block tracking-wider">รหัสผ่าน</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3"><Lock size={18} className="text-muted" /></span>
              <input
                type="password"
                className="form-control bg-light border-0 py-3 small"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-drpat-primary btn-lg w-100 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-4" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="d-flex align-items-center gap-2 my-4 text-muted opacity-50">
          <hr className="flex-grow-1" />
          <span className="tiny text-uppercase tracking-wider">หรือเข้าใช้งานผ่าน</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="d-grid gap-3">
          <button
            onClick={handleLineLogin}
            className="btn btn-light btn-lg py-3 rounded-4 shadow-xs d-flex align-items-center justify-content-center gap-3 border"
          >
            <MessageCircle size={20} fill="#06C755" className="text-success border-0" />
            <span className="small fw-bold">LINE Login</span>
          </button>

          <Link href="/patient/register" className="d-flex align-items-center justify-content-between p-3 border rounded-4 text-decoration-none text-dark hover-bg-light transition-all text-start shadow-xs">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary-custom bg-opacity-10 p-2 rounded-3">
                <Sparkles size={20} className="text-primary-custom" />
              </div>
              <div>
                <p className="fw-bold mb-0 small">ยังไม่มีบัญชี?</p>
                <p className="tiny text-muted mb-0">ลงทะเบียนคนไข้ใหม่</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </Link>
        </div>

        <div className="mt-5 pt-4 border-top">
          <p className="tiny text-muted mb-0">การเข้าสู่ระบบเป็นไปตามนโยบาย PDPA ของ TSPI Clinic</p>
        </div>
      </div>

      <style jsx>{`
        .hover-bg-light:hover { background-color: #f8f9fa; transform: translateY(-2px); }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
