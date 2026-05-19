"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, X, Bell, User, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/utils/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isAuthPage = pathname === "/patient/login" || pathname === "/patient/register";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser && !isAuthPage) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [isAuthPage, router]);

  // Hide sidebar and header for non-authenticated pages or explicitly on login/register
  const showBars = !isAuthPage && user;

  return (
    <div className="d-flex vh-100 bg-secondary-custom overflow-hidden font-kanit">
      {/* Desktop Sidebar Container */}
      {showBars && (
        <aside className="d-none d-lg-block shadow-sm h-100 sticky-top border-end animate-fade-in" style={{ width: '280px', backgroundColor: 'var(--drpat-card)', zIndex: 1040 }}>
          {/* Branding Area for Patient Portal */}
          <div className="border-bottom px-4 d-flex align-items-center bg-white" style={{ height: '64px' }}>
            <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none">
              <div className="bg-primary-custom shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px' }}>
                <Shield size={18} className="text-white" />
              </div>
              <span className="fw-bold text-dark fs-5 mb-0">TSPI <span className="text-primary-custom">Clinic</span></span>
            </Link>
          </div>
          <Sidebar role="patient" userName={user?.displayName || "คุณสมชาย ใจดี"} />
        </aside>
      )}

      {/* Main Content Container */}
      <div className="flex-grow-1 d-flex flex-column h-100 position-relative">

        {/* Header Area */}
        {showBars && (
          <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top shadow-xs animate-fade-in">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="btn btn-light rounded-circle p-2 d-lg-none shadow-sm border"
              >
                <Menu size={20} className="text-dark" />
              </button>
              <div className="d-flex flex-column">
                <h5 className="fw-bold mb-0 text-dark">Patient Portal</h5>
                <p className="tiny text-muted mb-0">ดูแลสุขภาพอัจฉริยะแบบเจาะจงบุคคล</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light rounded-circle p-2 position-relative shadow-sm border d-none d-md-flex">
                <Bell size={20} className="text-muted" />
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-white rounded-circle"></span>
              </button>
              <div className="d-flex align-items-center gap-3 border-start ps-3">
                <div className="text-end d-none d-md-block">
                  <p className="small fw-bold mb-0 text-dark">{user?.displayName || "คุณสมชาย ใจดี"}</p>
                  <p className="tiny text-primary-custom mb-0 text-uppercase fw-bold tracking-wider">Member ID: TSPI-{user?.uid?.slice(0, 4)}</p>
                </div>
                <div className="bg-primary-custom bg-opacity-10 border border-primary-custom border-opacity-20 rounded-circle text-primary-custom d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '42px', height: '42px' }}>
                  <User size={20} />
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Mobile Sidebar Slide-out */}
        {showBars && (
          <div className={`d-lg-none position-fixed inset-0 mobile-sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`} style={{ zIndex: 1050 }}>
            <div className="backdrop-dim" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className={`sidebar-slide-content h-100 shadow-2xl ${isMobileMenuOpen ? 'show' : ''}`} style={{ width: '280px' }}>
              <Sidebar role="patient" userName={user?.displayName || "คุณสมชาย ใจดี"} isMobile={true} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="position-absolute top-0 end-0 m-3 btn btn-dark rounded-circle p-2 border border-white border-opacity-10 shadow-lg"
                style={{ zIndex: 1200 }}
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-grow-1 overflow-auto bg-secondary-custom">
          {children}
        </main>
      </div>

    </div>
  );
}
