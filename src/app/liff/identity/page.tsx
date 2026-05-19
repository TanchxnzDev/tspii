"use client"

import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./identity.css";

export default function LiffIdentity() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID || "" });
        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
        } else {
          liff.login();
        }
      } catch (err) {
        console.error("LIFF Initialization failed", err);
      } finally {
        setLoading(false);
      }
    };
    initLiff();
  }, []);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    
    // TODO: เชื่อมต่อกับ backend_engine_v-twin เพื่อตรวจสอบข้อมูล
    console.log("Linking phone:", phone, "with LINE ID:", profile?.userId);
    
    setTimeout(() => {
      alert("ระบบได้รับข้อมูลแล้ว กำลังดำเนินการตรวจสอบประวัติการรักษาครับ");
      setIsLinking(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="liff-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="liff-container">
      <div className="premium-card">
        <div className="card-header-gradient">
          <h2 className="h4 mb-0 fw-bold">ยืนยันตัวตนคนไข้</h2>
          <p className="small mb-0 opacity-75">เพื่อเชื่อมต่อประวัติการรักษาของคุณ</p>
        </div>

        <div className="p-4 pt-5 text-center">
          <div className="profile-img-container">
            {profile?.pictureUrl ? (
              <img src={profile.pictureUrl} alt="Profile" className="profile-img" />
            ) : (
              <div className="bg-light w-100 h-100 d-flex align-items-center justify-content-center">
                <i className="bi bi-person fs-2 text-muted"></i>
              </div>
            )}
          </div>
          
          <h3 className="h5 fw-bold mb-1">สวัสดีครับคุณ {profile?.displayName}</h3>
          <p className="text-muted small mb-4">ยินดีต้อนรับเข้าสู่ระบบ Dr. Pat</p>

          <form onSubmit={handleLink} className="text-start mt-4">
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">เบอร์โทรศัพท์ที่เคยแจ้งไว้</label>
              <input 
                type="tel" 
                className="form-control form-control-premium" 
                placeholder="08X-XXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 btn-premium shadow-sm"
              disabled={isLinking}
            >
              {isLinking ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>กำลังตรวจสอบ...</>
              ) : (
                "ยืนยันข้อมูล"
              )}
            </button>
            
            <p className="text-center mt-4 small text-muted">
              ยังไม่เคยมีประวัติกับเรา? <br/>
              <a href="#" className="text-primary text-decoration-none fw-bold">ลงทะเบียนคนไข้ใหม่</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
