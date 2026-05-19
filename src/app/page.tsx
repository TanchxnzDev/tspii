"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db } from "@/utils/firebase/client";
import { OAuthProvider, signInWithPopup, getRedirectResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useLiff } from "@/components/providers/LiffProvider";
import {
  Menu,
  X,
  ArrowRight,
  Activity,
  Sparkles,
  Brain,
  ChevronRight,
  FileText,
  LayoutGrid,
  Shield,
  Clock,
  Users,
  Star,
  TrendingUp,
  Microscope,
  CircleCheck,
  GraduationCap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  LogIn,
  FlaskConical,
  HeartPulse,
  Zap
} from "lucide-react";

export default function Home() {
  const [debugStatus, setDebugStatus] = useState("Initializing...");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { liff, isLoggedIn, profile } = useLiff();
  const router = useRouter();

  // ตรวจสอบว่าผู้ใช้มีข้อมูลใน Firestore หรือไม่
  const checkPatientExists = async (uid: string): Promise<boolean> => {
    try {
      const patientRef = doc(db, "patients", uid);
      const patientSnap = await getDoc(patientRef);
      return patientSnap.exists();
    } catch (error) {
      console.error("Error checking patient:", error);
      return false;
    }
  };

  // นำทางตามสถานะผู้ใช้
  const redirectUser = async (uid: string) => {
    const exists = await checkPatientExists(uid);
    if (exists) {
      router.push('/patient/dashboard');
    } else {
      router.push('/patient/register');
    }
  };

  useEffect(() => {
    const handleAuthResult = async () => {
      setDebugStatus("Checking redirect result...");
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setDebugStatus("SUCCESS: User found: " + result.user.uid);
          await redirectUser(result.user.uid);
        } else {
          setDebugStatus("No redirect result (Ready to login)");
        }
      } catch (error: any) {
        setDebugStatus("REDIRECT ERROR: " + error.message);
        console.error("Auth redirect error:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setDebugStatus("Active Session: " + user.uid);
        await redirectUser(user.uid);
      }
      setCheckingAuth(false);
    });

    handleAuthResult();
    return () => unsubscribe();
  }, [router]);

  const handleLineLogin = async () => {
    console.log("Button Clicked!");
    // If inside LINE app, use LIFF logic
    try {
      if (liff && liff.isInClient()) {
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          // 🟢 ใช้ LIFF profile ตรวจ Firestore
          const lineProfile = await liff.getProfile();
          const lineUid = lineProfile.userId;
          const patientRef = doc(db, "patients", lineUid);
          const patientSnap = await getDoc(patientRef);
          if (patientSnap.exists()) {
            router.push('/patient/dashboard');
          } else {
            router.push('/patient/register');
          }
        }
        return;
      }
    } catch (e) { console.error(e); }

    // Firebase LINE Login (OIDC)
    const provider = new OAuthProvider('oidc.line');
    setDebugStatus("Opening LINE Popup...");
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setDebugStatus("SUCCESS! Redirecting...");
        await redirectUser(result.user.uid);
      }
    } catch (error: any) {
      console.error("Firebase LINE Login Error:", error);
      setDebugStatus("POPUP ERROR: " + error.message);
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-white">
      {/* DEBUG STATUS OVERLAY */}
      <div className="bg-dark text-white tiny p-1 text-center position-fixed top-0 w-100" style={{ zIndex: 9999, fontSize: '10px', opacity: 0.8 }}>
        Debug: {debugStatus}
      </div>

      {/* ========== NAVIGATION ========== */}
      <nav className={`fixed-top transition-all duration-300 ${scrolled ? "nav-premium shadow-sm py-2" : "nav-premium py-3"}`} style={{ zIndex: 1100 }}>
        <div className="container d-flex align-items-center justify-content-between">
          <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="overflow-hidden rounded-3 shadow-sm" style={{ width: '40px', height: '40px' }}>
              <img src="/logo_tspi.jpg" alt="TSPI Logo" className="w-100 h-100 object-fit-cover" />
            </div>
            <div>
              <span className={`h5 fw-bold mb-0 d-block ${scrolled ? "text-dark" : "text-dark"}`}>
                TSPI <span className="text-primary-custom">CLINIC</span>
              </span>
              <p className="small text-muted mb-0" style={{ fontSize: '10px' }}>Systems Biology AI Expert</p>
            </div>
          </Link>

          <div className="d-none d-md-flex align-items-center gap-4">
            {["Platform", "Protocol", "Research", "About"].map((item) => (
              <Link key={item} href="#" className="text-decoration-none text-dark fw-medium small hover-primary">{item}</Link>
            ))}
            <div className="d-flex gap-2 ms-3">
              <button onClick={handleLineLogin} className="btn btn-drpat-primary btn-sm px-4 shadow-sm">เข้าสู่ระบบด้วย LINE</button>
            </div>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn d-md-none border-0 p-2 text-primary-custom">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-container d-md-none animate-fade-in">
            <div className="d-grid gap-3 text-center">
              {["Platform", "Protocol", "Research", "About"].map((item) => (
                <Link key={item} href="#" className="text-decoration-none text-dark fw-bold py-2 border-bottom border-light">{item}</Link>
              ))}
              <div className="d-grid gap-2 mt-2 px-3">
                <button onClick={handleLineLogin} className="btn btn-drpat-primary shadow-sm">เข้าสู่ระบบด้วย LINE</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="hero-gradient overflow-hidden pt-5 mt-5">
        <div className="container position-relative animate-fade-in-up">
          <div className="row align-items-center g-4">
            <div className="col-lg-6 text-center text-lg-start order-2 order-lg-1">
              <div className="badge-pill-custom mb-3 shadow-sm mx-auto mx-lg-0">
                <Sparkles size={14} />
                <span>Next-Generation Healthcare AI</span>
              </div>
              <h1 className="fw-bold mb-3 mb-lg-4" style={{ lineHeight: 1.2 }}>
                {isLoggedIn && profile ? (
                  <>สวัสดีคุณ <span className="text-primary-custom">{profile.displayName}</span></>
                ) : (
                  <>ดูแลสุขภาพด้วย <br /><span className="text-primary-custom">TSPI CLINIC AI</span></>
                )}
              </h1>
              <p className="text-muted mb-4 mb-lg-5 px-3 px-lg-0">
                ยินดีต้อนรับสู่ระบบ <strong>TSPI CLINIC™</strong> นวัตกรรมการรักษายุคใหม่
                วิเคราะห์เชิงลึกด้วยกลไกชีววิทยา 38 แกน เพื่อผลลัพธ์ที่แม่นยำที่สุด
              </p>
              <div className="d-grid d-sm-flex gap-3 justify-content-center justify-content-lg-start px-3 px-lg-0">
                <button onClick={handleLineLogin} className="btn btn-line-lg shadow-lg">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" width={24} height={24} className="me-2" />
                  เข้าสู่ระบบด้วย LINE
                </button>
              </div>

              <div className="mt-5 d-flex align-items-center gap-3 gap-lg-4 justify-content-center justify-content-lg-start opacity-75">
                <div className="text-center">
                  <div className="h5 fw-bold mb-0">10k+</div>
                  <div className="tiny text-muted uppercase tracking-wider">Patients</div>
                </div>
                <div className="vr"></div>
                <div className="text-center">
                  <div className="h5 fw-bold mb-0">38</div>
                  <div className="tiny text-muted uppercase tracking-wider">Bio-Axes</div>
                </div>
                <div className="vr"></div>
                <div className="text-center">
                  <div className="h5 fw-bold mb-0">98%</div>
                  <div className="tiny text-muted uppercase tracking-wider">Success</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="position-relative px-4 px-lg-0">
                <div className="bg-primary-custom position-absolute top-50 start-50 translate-middle rounded-circle opacity-10" style={{ width: '100%', height: '100%', filter: 'blur(80px)' }}></div>
                <img
                  src="/images/hero.png"
                  alt="Medical AI"
                  className="img-fluid rounded-4 shadow-lg position-relative z-1"
                  style={{ border: '4px solid white' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 9-STEP PROTOCOL ========== */}
      <section className="py-5 bg-white">
        <div className="container py-lg-5">
          <div className="text-center mb-4 mb-lg-5 animate-fade-in-up px-3">
            <div className="badge-pill-custom mb-3">Clinical Protocol</div>
            <h2 className="fw-bold mb-3">TSPI CLINIC 9-Step Recovery Protocol</h2>
            <p className="text-muted mx-auto small" style={{ maxWidth: '700px' }}>
              มาตรฐานการดูแลรักษาที่เน้นการกำจัดสาเหตุระดับกลไก (Mechanistic) เพื่อการฟื้นฟูสุขภาพอย่างยั่งยืน
            </p>
          </div>

          <div className="row g-3 g-lg-4 mt-2 mt-lg-4 px-2">
            {[
              { step: "01", phase: "Phase 1", title: "Deep Assessment", desc: "วิเคราะห์เชิงลึกด้วย AI 36 แกน", icon: "🔬" },
              { step: "02", phase: "Phase 1", title: "Detoxification", desc: "กำจัดสารพิษระดับเซลล์", icon: "🧪" },
              { step: "03", phase: "Phase 1", title: "Gut Restoration", desc: "ฟื้นฟูสมดุลลำไส้", icon: "🦠" },
              { step: "04", phase: "Phase 2", title: "Metabolic Reset", desc: "ปรับสมดุลระบบเผาผลาญ", icon: "⚡" },
              { step: "05", phase: "Phase 2", title: "Hormonal Balance", desc: "ปรับสมดุลฮอร์โมน", icon: "⚖️" },
              { step: "06", phase: "Phase 2", title: "Immune Modulation", desc: "ปรับสมดุลภูมิคุ้มกัน", icon: "🛡️" },
              { step: "07", phase: "Phase 3", title: "Cellular Repair", desc: "ซ่อมแซมระดับเซลล์", icon: "🔧" },
              { step: "08", phase: "Phase 3", title: "Neuroplasticity", desc: "ฟื้นฟูระบบประสาท", icon: "🧠" },
              { step: "09", phase: "Phase 3", title: "Longevity Protocol", desc: "ดูแลสุขภาพระยะยาว", icon: "✨" },
            ].map((item, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4">
                <div className="card-service p-4 animate-fade-in-up h-100" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h1 fw-bold text-light opacity-50 mb-0">{item.step}</span>
                    <span className="badge-pill-custom py-1">{item.phase}</span>
                  </div>
                  <h4 className="fw-bold mb-2 h5">{item.icon} {item.title}</h4>
                  <p className="small text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY US / CLINICAL VALIDATION ========== */}
      <section className="py-5 bg-secondary-custom">
        <div className="container py-lg-5 px-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <div className="badge-pill-custom mb-3">Why TSPI Clinic</div>
              <h2 className="fw-bold mb-4 text-dark">Precision Medicine <br />Reimagined</h2>
              <p className="text-muted mb-4 mb-lg-5">เราใช้เทคโนโลยี AI วิเคราะห์ข้อมูลสุขภาพเชิงลึกผ่าน 38 แกนกลไกชีววิทยา เพื่อสร้างแผนการรักษาที่แม่นยำที่สุดสำหรับคนไข้รายบุคคล</p>

              <div className="row g-3 text-start">
                {[
                  { icon: HeartPulse, text: "Personalized protocols" },
                  { icon: Activity, text: "Real-time monitoring" },
                  { icon: Microscope, text: "Evidence-based modules" },
                  { icon: Brain, text: "24/7 AI clinical support" }
                ].map((item, i) => (
                  <div key={i} className="col-12 col-sm-6 d-flex align-items-center gap-3">
                    <div className="bg-white p-2 rounded-circle shadow-sm">
                      <item.icon size={18} className="text-primary-custom" />
                    </div>
                    <span className="small fw-medium text-dark">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="bg-white p-4 p-lg-5 rounded-5 shadow-lg border-0">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <GraduationCap size={32} className="text-primary-custom" />
                  <div>
                    <h5 className="fw-bold mb-0">AI Clinical Validation</h5>
                    <p className="tiny text-muted">Certified Medical AI System</p>
                  </div>
                </div>
                <hr />
                <div className="mt-4">
                  {[
                    { label: "Accuracy Rate", val: "97.8%" },
                    { label: "Patient Satisfaction", val: "96.2%" },
                    { label: "Recovery Timeline", val: "43%" }
                  ].map((stat, i) => (
                    <div key={i} className="mb-3 mb-lg-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="tiny fw-bold text-muted">{stat.label}</span>
                        <span className="tiny fw-bold text-primary-custom">{stat.val}</span>
                      </div>
                      <div className="progress-premium">
                        <div className="progress-bar-premium h-100" style={{ width: stat.val }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="container py-5 my-5">
        <div className="cta-banner text-center shadow-lg">
          <h2 className="display-6 fw-bold mb-3">พร้อมเริ่มต้นการรักษาของคุณหรือยัง?</h2>
          <p className="lead opacity-75 mb-5 mx-auto" style={{ maxWidth: '600px' }}>เข้าร่วมกับผู้ป่วยมากกว่า 10,000 รายที่ไว้วางใจ TSPI CLINIC AI ให้ดูแลสุขภาพของคุณในระยะยาว</p>
          <button onClick={handleLineLogin} className="btn btn-line-lg px-5 py-3 shadow-lg">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" width={28} height={28} className="me-2" />
            เข้าสู่ระบบด้วย LINE ทันที
          </button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-5 bg-white border-top">
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="overflow-hidden rounded-2" style={{ width: '32px', height: '32px' }}>
                  <img src="/logo_tspi.jpg" alt="TSPI Logo" className="w-100 h-100 object-fit-cover" />
                </div>
                <span className="h5 fw-bold mb-0">TSPI <span className="text-primary-custom">CLINIC</span></span>
              </div>
              <p className="text-muted small pe-md-5">แพลตฟอร์มการแพทย์แม่นยำที่ขับเคลื่อนด้วย AI เพื่อการดูแลสุขภาพเฉพาะบุคคลที่เข้าถึงง่ายและมีประสิทธิภาพสูงสุด</p>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="fw-bold mb-4">Platform</h6>
              <div className="d-grid gap-2 small text-muted">
                <Link href="#" className="text-decoration-none text-muted hover-primary">Features</Link>
                <Link href="#" className="text-decoration-none text-muted hover-primary">Protocol</Link>
                <Link href="#" className="text-decoration-none text-muted hover-primary">Research</Link>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="fw-bold mb-4">Support</h6>
              <div className="d-grid gap-2 small text-muted">
                <Link href="#" className="text-decoration-none text-muted hover-primary">Help Center</Link>
                <Link href="#" className="text-decoration-none text-muted hover-primary">Contact Us</Link>
                <Link href="/legal/privacy" className="text-decoration-none text-muted hover-primary">Privacy Policy</Link>
                <Link href="/legal/terms" className="text-decoration-none text-muted hover-primary">Terms of Service</Link>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <h6 className="fw-bold mb-4">Connect With Us</h6>
              <div className="d-flex gap-3 justify-content-md-end mb-4">
                <div className="bg-light p-2 rounded-circle cursor-pointer"><Globe size={20} /></div>
                <div className="bg-light p-2 rounded-circle cursor-pointer"><Mail size={20} /></div>
                <div className="bg-light p-2 rounded-circle cursor-pointer"><Phone size={20} /></div>
                <div className="bg-light p-2 rounded-circle cursor-pointer"><MapPin size={20} /></div>
              </div>
              <p className="tiny text-muted mb-0">123 Clinical Center, Innovation District<br />Bangkok, Thailand</p>
            </div>
          </div>
          <hr />
          <p className="text-center tiny text-muted mb-0 pt-4">© 2026 TSPI Clinic Intelligence Platform. All rights reserved.</p>
        </div>
      </footer>

      {/* ========== LOGIN MODAL ========== */}
      {showRoleModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-5 shadow-2xl p-4 overflow-hidden position-relative">
              <div className="position-absolute top-0 end-0 p-3">
                <button onClick={() => setShowRoleModal(false)} className="btn btn-light rounded-circle p-2"><X size={20} /></button>
              </div>
              <div className="text-center mb-4 mt-2">
                <div className="bg-primary-custom bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                  <LogIn size={40} className="text-primary-custom" />
                </div>
                <h3 className="fw-bold mb-1">เลือกประเภทผู้ใช้งาน</h3>
                <p className="text-muted small">กรุณาเลือกบทบาทเพื่อเข้าสู่ระบบที่เหมาะสม</p>
              </div>

              <div className="d-grid gap-3 p-2">
                <Link href="/patient/login" className="d-flex align-items-center gap-4 p-4 border rounded-4 text-decoration-none text-dark hover-border-primary transition-all">
                  <div className="bg-primary-custom bg-opacity-10 p-3 rounded-4"><Users size={28} className="text-primary-custom" /></div>
                  <div className="flex-grow-1">
                    <p className="fw-bold mb-0">ผู้ป่วย</p>
                    <p className="tiny text-muted mb-0">ดูประวัติการรักษาและนัดหมาย</p>
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </Link>

                <Link href="/doctor/login" className="d-flex align-items-center gap-4 p-4 border rounded-4 text-decoration-none text-dark hover-border-primary transition-all">
                  <div className="bg-info bg-opacity-10 p-3 rounded-4"><Stethoscope size={28} className="text-info" /></div>
                  <div className="flex-grow-1">
                    <p className="fw-bold mb-0">แพทย์ / บุคลากร</p>
                    <p className="tiny text-muted mb-0">จัดการคนไข้และแผนการรักษา</p>
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-primary:hover { color: var(--drpat-primary) !important; }
        .hover-border-primary:hover { 
          border-color: var(--drpat-primary) !important; 
          background-color: rgba(255, 116, 68, 0.05);
          transform: scale(1.02);
        }
        .tiny { font-size: 0.75rem; }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .btn-line-lg {
          background-color: #06C755;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .btn-line-lg:hover {
          background-color: #05b04a;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(6, 199, 85, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
}
