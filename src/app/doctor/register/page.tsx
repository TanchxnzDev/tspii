"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/utils/firebase/client";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Shield, Lock, Mail, ArrowLeft, UserPlus, Loader2, ShieldAlert, User } from "lucide-react";

export default function DoctorRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Profile Name
      await updateProfile(user, { displayName: name });

      // 3. Save Doctor Profile to Firestore
      await setDoc(doc(db, "doctors", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "doctor",
        createdAt: new Date().toISOString(),
      });

      // 4. Redirect to Dashboard
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error("Doctor Registration Error:", err);
      setError(err.message || "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-secondary-custom p-3 font-kanit">
      <div className="bg-white rounded-5 shadow-lg p-4 p-md-5 w-100 animate-fade-in" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-5">
          <div className="d-flex justify-content-start mb-4">
            <Link href="/doctor/login" className="btn btn-light rounded-circle p-2 shadow-sm">
              <ArrowLeft size={20} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-circle shadow-sm mx-auto mb-3" style={{ width: '80px', height: '80px', border: '3px solid var(--drpat-card)' }}>
            <img src="/logo_tspi.jpg" alt="TSPI Logo" className="w-100 h-100 object-fit-cover" />
          </div>
          <h3 className="fw-bold text-dark">Doctor Registration</h3>
          <p className="text-muted small">Create your Clinical Staff account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-4 text-danger tiny fw-bold d-flex align-items-center gap-2 justify-content-center">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-grid gap-4">
          <div className="form-group text-start">
            <label className="tiny fw-bold text-muted mb-2 text-uppercase tracking-wider">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3"><User size={18} className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-0 py-3 small"
                placeholder="Dr. Tan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group text-start">
            <label className="tiny fw-bold text-muted mb-2 text-uppercase tracking-wider">Staff Email</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3"><Mail size={18} className="text-muted" /></span>
              <input
                type="email"
                className="form-control bg-light border-0 py-3 small"
                placeholder="doctor@tspi-clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group text-start">
            <label className="tiny fw-bold text-muted mb-2 text-uppercase tracking-wider">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3"><Lock size={18} className="text-muted" /></span>
              <input
                type="password"
                className="form-control bg-light border-0 py-3 small"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-drpat-primary btn-lg w-100 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2 rounded-4" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><UserPlus size={20} /> ลงทะเบียนหมอ</>}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="small text-muted">
            มีบัญชีอยู่แล้ว? <Link href="/doctor/login" className="text-drpat-primary fw-bold text-decoration-none">เข้าสู่ระบบที่นี่</Link>
          </p>
        </div>

        <div className="mt-4 pt-4 border-top text-center text-muted">
          <p className="tiny mb-0">Security Level: Grade-A Medical Data Encryption</p>
        </div>
      </div>
    </div>
  );
}
