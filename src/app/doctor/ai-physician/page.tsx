"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/utils/firebase/client";
import {
  collection, doc, getDoc, getDocs, updateDoc, addDoc, query as firestoreQuery, where, orderBy, limit
} from "firebase/firestore";
import {
  Brain, Users, Search, Send, Loader2, ShieldCheck,
  Mic, StopCircle, CheckCircle, Play, Pause, ChevronRight, RefreshCw,
  Image, Paperclip, Save, History, Share2, X, Zap
} from "lucide-react";

import BiologicalHUD from "@/components/intelligence/BiologicalHUD";
import ContextInspector from "@/components/intelligence/ContextInspector";
import QuickActionMenu from "@/components/intelligence/QuickActionMenu";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { medicalDb } from "@/lib/medical-data";

// ── Style helpers ────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "20px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#6B7280",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "16px",
};

export default function AIPhysicianPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>กำลังโหลด Neural Engine…</p>
      </div>
    }>
      <ErrorBoundary>
        <AIPhysicianContent />
      </ErrorBoundary>
    </Suspense>
  );
}

function AIPhysicianContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientIdFromUrl = searchParams.get("id");

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientIdFromUrl);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [axisData, setAxisData] = useState<any[]>([]);

  // ── Workflow States ──────────────────────────────────────────
  const [workflowPhase, setWorkflowPhase] = useState<"intake" | "analysis">("intake");
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [intakeSummary, setIntakeSummary] = useState<string | null>(null);
  const [isProcessingIntake, setIsProcessingIntake] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSaveIntake = async () => {
    if (!selectedPatientId || !intakeSummary) {
      alert("กรุณาเลือกคนไข้และประมวลผลอาการก่อนบันทึกครับ");
      return;
    }

    setIsSaving(true);
    try {
      const patientRef = doc(db, "patients", selectedPatientId);

      // 1. Update Root Patient Doc
      await updateDoc(patientRef, {
        symptoms: intakeSummary,
        lastIntakeDate: new Date().toISOString()
      });

      // 2. Create in TOP-LEVEL collection for easier access
      const intakesRef = collection(db, "tspi_clinical_intakes");
      const { addDoc } = await import("firebase/firestore");
      await addDoc(intakesRef, {
        patientId: selectedPatientId,
        patientName: patientInfo?.fname + " " + patientInfo?.lname,
        summary: intakeSummary,
        rawTranscription: transcription,
        timestamp: new Date().toISOString(),
      });

      await loadPatientData(selectedPatientId);
      alert("✅ บันทึกลงระบบส่วนกลาง (tspi_clinical_intakes) เรียบร้อยแล้วครับ!");
    } catch (err: any) {
      console.error("🔥 Firestore Save Error:", err);
      alert(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isRecording && transcription === "" && workflowPhase === 'intake') {
      // Simulate transcription after recording stops
    }
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      // 🛑 Stop recording
      setIsRecording(false);
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
        recorder.stream.getTracks().forEach(t => t.stop());
      }
    } else {
      try {
        // 🎙️ 1. Request Microphone Access + GPS
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        navigator.geolocation.getCurrentPosition(
          (pos) => console.log("Clinical Location Captured:", pos.coords.latitude, pos.coords.longitude),
          (err) => console.warn("GPS Access Denied:", err.message)
        );

        // 2. Setup MediaRecorder
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType,
          });

          if (audioBlob.size < 100) {
            console.warn("⚠️ Empty recording, skipping...");
            return;
          }

          // 3. Send to voice-to-form API
          setIsProcessingIntake(true);
          try {
            const formData = new FormData();
            formData.append("file", audioBlob, `recording_${Date.now()}.webm`);

            const res = await fetch("/api/doctor/voice-to-form", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setTranscription(data.text || "");
            setIntakeSummary(data.summary || "");
            console.log("✅ Voice transcribed:", data.text?.slice(0, 100));
          } catch (err: any) {
            console.error("Voice processing error:", err);
            setTranscription(`⚠️ การถอดเสียงล้มเหลว: ${err.message}`);
          } finally {
            setIsProcessingIntake(false);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
        setTranscription("");
        setIntakeSummary(null);
      } catch (err: any) {
        alert(`ไม่สามารถเริ่มการซักถามได้: ${err.message}\nโปรดอนุญาตสิทธิ์การใช้ไมโครโฟนในเบราว์เซอร์ครับ`);
      }
    }
  };
  const fetchHistory = async () => {
    console.log("Fetching history for:", selectedPatientId);
    if (!selectedPatientId) return;
    try {
      // Simplified query to avoid index requirements
      const q = firestoreQuery(
        collection(db, "tspi_clinical_intakes"),
        where("patientId", "==", selectedPatientId),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort manually in memory
      const sortedItems = items.sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setHistoryItems(sortedItems);
      setShowHistoryModal(true);
      console.log("✅ History loaded:", sortedItems.length, "items");
    } catch (err: any) {
      console.error("🔥 Fetch History Error:", err);
      alert(`ไม่สามารถดึงประวัติได้: ${err.message}`);
    }
  };

  const handleSaveAnalysis = async (content: string) => {
    if (!selectedPatientId) return;
    try {
      await addDoc(collection(db, "tspi_clinical_analyses"), {
        patientId: selectedPatientId,
        content,
        timestamp: new Date().toISOString(),
        mission: activeMission,
        visibleToPatient: true
      });
    } catch (err) {
      console.error("Error saving analysis:", err);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await medicalDb.getPatientList();
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    fetchPatients();

    if (patientIdFromUrl) {
      setSelectedPatientId(patientIdFromUrl);
      loadPatientData(patientIdFromUrl);
    }
  }, [patientIdFromUrl]);

  const loadPatientData = async (id: string) => {
    try {
      const data = await medicalDb.getPatient(id);
      if (data) {
        const pInfo = {
          ...data,
          name: data.name || `${data.fname || data.firstName || "Unknown"} ${data.lname || data.lastName || ""}`.trim(),
        };
        setPatientInfo(pInfo);

        // 🧠 Real-time Heuristic Reasoning for Digital Twin HUD
        let processedAxes: any[] = [];

        // ✅ Load Axis Definitions from tspi_axes_v4 collection (NO MOCKUP)
        const axesSnap = await getDocs(collection(db, "tspi_axes_v4"));
        const patientAxes = data.axes || {}; // Scores saved from previous AI analysis

        const loadedAxes = axesSnap.docs
          .filter(d => d.id !== "_status")
          .map(d => {
            const axDef = d.data();
            const axisKey = `AXIS_${axDef.axis_id}`;
            const savedScore = patientAxes[axisKey] || patientAxes[d.id] || {};
            return {
              axis_id: d.id,            // e.g. "AXIS_1"
              axis_name: axDef.name,    // e.g. "Systemic Inflammatory Load"
              domain_id: axDef.domain_id,
              domain_title: axDef.domain_title,
              severity: savedScore.score || 0,   // 0 = ยังไม่ได้วิเคราะห์
              insight: savedScore.insight || "",
            };
          })
          .sort((a, b) => (a.domain_id || 0) - (b.domain_id || 0));

        processedAxes = loadedAxes;


        setAxisData(processedAxes);
      }
    } catch (err) {
      console.error("Error loading patient info:", err);
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    loadPatientData(id);
    setShowPatientSearch(false);
    setMessages([]);
    setActiveMission(null);
    router.push(`/doctor/ai-physician?id=${id}`);
  };

  const handleQuickAction = (_actionId: string, label: string) => {
    if (!selectedPatientId) return;
    setActiveMission(label);
    setQuery(`[Mission: ${label}] โปรดวิเคราะห์ข้อมูลคนไข้รายนี้ในประเด็น "${label}" โดยละเอียด อ้างอิงจากประวัติการตรวจและแกนชีวภาพที่มีอยู่ครับ`);
  };

  const handleAnalyze = async () => {
    if (!query.trim() || !selectedPatientId) return;
    setIsAnalyzing(true);

    const userMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");

    try {
      console.log("🚀 Sending to AI Brain with Bio-Feedback loop...");
      // 🛡️ Only proceed if real axes are loaded from Firestore
      if (axisData.length === 0) {
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ กรุณาเลือกคนไข้และรอให้ระบบโหลดข้อมูลแกนชีวภาพจาก Firestore ก่อนครับ" }]);
        setIsAnalyzing(false);
        return;
      }
      const currentAxes = axisData;

      const res = await fetch("/api/ai/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          patientId: selectedPatientId,
          clinicalContext: {
            symptoms: intakeSummary || patientInfo?.symptoms,
            patientName: `${patientInfo?.fname} ${patientInfo?.lname}`,
            hn: patientInfo?.hn,
            axes: currentAxes
          },
          engine: "groq",
          // ✅ System instruction ที่ถูกต้อง — บังคับ AI ส่ง JSON เสมอ
          systemInstruction: `เมื่อวิเคราะห์เสร็จ ให้ปิดท้ายด้วย JSON block นี้เสมอ โดยประเมินค่า severity (0-100) ตามความรุนแรงทางคลินิกจริง:
:::BIO_UPDATE::: {"axes":[{"axis_id":"D1_1","severity":XX,"insight":"..."},{"axis_id":"D3_1","severity":XX,"insight":"..."},{"axis_id":"D5_1","severity":XX,"insight":"..."},{"axis_id":"D9_1","severity":XX,"insight":"..."}]} :::`,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 🧠 Parse Bio-Feedback from AI response
      let mainContent = data.content;

      // Extract JSON block
      const bioMatch = mainContent.match(/:::BIO_UPDATE:::(.*?):::/s);
      let updates: any[] = [];

      if (bioMatch) {
        try {
          const bioUpdate = JSON.parse(bioMatch[1].trim());
          if (bioUpdate.axes) updates = bioUpdate.axes;
          mainContent = mainContent.replace(/:::BIO_UPDATE:::.*?:::/s, "").trim();
          console.log("✅ Bio-Feedback received:", updates);
        } catch (e) {
          console.warn("⚠️ Failed to parse bio-feedback JSON:", e);
        }
      }

      // Fallback: Regex extraction from Thai text
      if (updates.length === 0) {
        const patterns = [
          { axis_id: "D1_1", regex: /(?:Detox|ตับ|พิษ).*?(\d+)%/i },
          { axis_id: "D3_1", regex: /(?:Metabolic|น้ำตาล|เบาหวาน).*?(\d+)%/i },
          { axis_id: "D5_1", regex: /(?:Cardio|หัวใจ|หลอดเลือด).*?(\d+)%/i },
          { axis_id: "D9_1", regex: /(?:Neuro|ประสาท|นอน).*?(\d+)%/i },
        ];
        patterns.forEach(p => {
          const match = mainContent.match(p.regex);
          if (match && match[1]) {
            updates.push({ axis_id: p.axis_id, severity: parseInt(match[1]), insight: "สกัดจากบทวิเคราะห์ AI" });
          }
        });
      }

      // ✅ Update HUD State
      if (updates.length > 0) {
        const updatedAxes = currentAxes.map(ax => {
          const u = updates.find((u: any) => u.axis_id === ax.axis_id);
          return u ? { ...ax, severity: u.severity, insight: u.insight } : ax;
        });
        setAxisData(updatedAxes);
        console.log("🧬 HUD Updated:", updatedAxes);

        // 💾 Persist to Firestore
        const axesMap = updatedAxes.reduce((acc, ax) => ({
          ...acc,
          [ax.axis_id]: { score: ax.severity, insight: ax.insight, axis_name: ax.axis_name }
        }), {});
        await updateDoc(doc(db, "patients", selectedPatientId), { axes: axesMap });
      }

      const assistantMessage = { role: "assistant", content: mainContent };
      setMessages(prev => [...prev, assistantMessage]);

      await handleSaveAnalysis(mainContent);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `เกิดข้อผิดพลาด: ${err.message}` }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    (p.name || p.fname || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.lname || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.hn || "").toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <div style={{ width: "40px", height: "40px", background: "#E8F0F5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={22} style={{ color: "#0A5C8E" }} />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1F2937", margin: 0 }}>
              AI Physician Assistant
            </h1>
          </div>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 0 52px", letterSpacing: "0.3px" }}>
            Clinical Reasoning Engine · 39 Mechanistic Axes
          </p>
        </div>

        {/* Patient selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowPatientSearch(v => !v)}
            className="btn btn-primary"
            style={{ fontSize: "13px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Users size={15} />
            {selectedPatientId && patientInfo ? patientInfo.name : "เลือกคนไข้"}
          </button>

          {showPatientSearch && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: "300px", ...card, zIndex: 200,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "16px",
            }}>
              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                border: "1px solid #E5E7EB", borderRadius: "4px",
                padding: "7px 12px", background: "#F9FAFB", marginBottom: "12px",
              }}>
                <Search size={13} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="ค้นหาชื่อหรือ HN…"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: "13px", flex: 1, color: "#1F2937" }}
                />
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }} className="custom-scrollbar">
                {filteredPatients.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "24px 0", fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                    ไม่พบข้อมูลคนไข้
                  </p>
                ) : (
                  filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 10px", background: "transparent", border: "none",
                        borderRadius: "4px", cursor: "pointer", marginBottom: "2px", textAlign: "left",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "#0A5C8E", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 600, flexShrink: 0,
                      }}>
                        {(p.name || p.fname || "?").charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name || `${p.fname} ${p.lname}`}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>HN: {p.hn || p.id}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── No patient ──────────────────────────────────────── */}
      {!selectedPatientId ? (
        <div style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
          <div style={{
            width: "64px", height: "64px", background: "#F3F4F6", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Brain size={36} style={{ color: "#D1D5DB" }} />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1F2937", marginBottom: "8px" }}>
            ยังไม่มีเซสชันการรักษา
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", maxWidth: "360px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            โปรดเลือกคนไข้เพื่อเริ่มการวิเคราะห์ด้วยระบบ AI Physician Assistant
          </p>
          <button onClick={() => setShowPatientSearch(true)} className="btn btn-primary" style={{ padding: "8px 24px" }}>
            เลือกคนไข้เพื่อเริ่มเซสชัน
          </button>
        </div>
      ) : (
        /* ── Two-column layout ─────────────────────────────── */
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", alignItems: "start" }}>

          {/* ══ LEFT: Patient info + HUD + Quick actions ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Patient info */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{
                  width: "52px", height: "52px", background: "#0A5C8E", color: "white",
                  borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", fontWeight: 600, flexShrink: 0,
                }}>
                  {patientInfo?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#1F2937", marginBottom: "2px" }}>
                    {patientInfo?.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>HN: {patientInfo?.hn}</div>
                  <span style={{
                    display: "inline-block", marginTop: "6px",
                    background: "#ECFDF5", color: "#059669",
                    fontSize: "11px", fontWeight: 500,
                    padding: "2px 10px", borderRadius: "20px",
                  }}>
                    Intelligence Relay Active
                  </span>
                </div>
              </div>

            </div>

            {/* Quick missions */}
            <div style={card}>
              <div style={sectionLabel}>Mission Control</div>
              <QuickActionMenu
                patientId={selectedPatientId}
                onActionSelect={handleQuickAction}
              />

              {/* 🆕 Advanced Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={fetchHistory}
                  style={{
                    padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "white",
                    display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#4B5563",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <History size={16} /> ประวัติการซักประวัติ
                </button>
                <button
                  onClick={() => setShowSendModal(true)}
                  style={{
                    padding: "10px", borderRadius: "8px", border: "none", background: "#059669",
                    display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "white",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <Share2 size={16} /> ส่งข้อมูลการรักษา
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: Multi-Step Clinical Flow ═══════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* 📋 Step 1: Clinical Intake & Tactical Reasoning */}
            <div style={{ ...card, background: "#1F2937", borderColor: "#374151", color: "#F9FAFB", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: workflowPhase === 'intake' ? '#10B981' : '#6B7280' }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Phase 01: Clinical Intake Console
                  </span>
                </div>
                {workflowPhase === 'analysis' && (
                  <button
                    onClick={() => {
                      setWorkflowPhase('intake');
                      setIntakeSummary(null);
                      setTranscription("");
                    }}
                    style={{ background: "transparent", border: "none", color: "#9CA3AF", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={12} /> New Patient Session
                  </button>
                )}
              </div>

              {/* Main Display Area (Transcription or Summary) */}
              <div style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "12px",
                padding: "20px",
                minHeight: "140px",
                marginBottom: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: transcription || intakeSummary || isRecording ? "flex-start" : "center",
                alignItems: transcription || intakeSummary || isRecording ? "stretch" : "center"
              }}>
                {isRecording ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "30px" }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} style={{ width: "4px", height: "12px", background: "#10B981", animation: `wave 0.8s infinite ${i * 0.1}s`, borderRadius: "2px" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700, letterSpacing: "1px" }}>RECORDING ACTIVE...</span>
                  </div>
                ) : intakeSummary ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#10B981" }}>
                      <CheckCircle size={16} />
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>VERIFIED CLINICAL SUMMARY</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#E5E7EB", margin: 0, lineHeight: 1.6 }}>{intakeSummary}</p>
                  </div>
                ) : transcription ? (
                  <p style={{ fontSize: "14px", color: "#D1D5DB", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>"{transcription}"</p>
                ) : (
                  <div style={{ textAlign: "center", color: "#4B5563" }}>
                    <Brain size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
                    <p style={{ fontSize: "13px", margin: 0 }}>พร้อมรับข้อมูลการซักประวัติ (เสียง, ข้อความ, หรือไฟล์)</p>
                  </div>
                )}
              </div>

              {/* Intake Tactical Command Bar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255,255,255,0.05)",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                {/* Actions */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setTranscription(`แนบไฟล์: ${file.name} (รอดำเนินการวิเคราะห์...)`);
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setTranscription(`แนบรูปภาพ: ${file.name} (รอดำเนินการวิเคราะห์...)`);
                    }}
                  />

                  <button
                    onClick={toggleRecording}
                    style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      background: isRecording ? "#EF4444" : "transparent",
                      border: "none", color: isRecording ? "white" : "#9CA3AF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    title="บันทึกเสียงซักถาม"
                  >
                    {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    style={{ width: "36px", height: "36px", borderRadius: "8px", background: "transparent", border: "none", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="ถ่ายรูปอาการ"
                  >
                    <Image size={20} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: "36px", height: "36px", borderRadius: "8px", background: "transparent", border: "none", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="แนบไฟล์ผล Lab"
                  >
                    <Paperclip size={20} />
                  </button>
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder={isRecording ? "Listening to patient..." : "สรุปอาการ หรือพิมพ์คำสั่งซักประวัติที่นี่..."}
                  disabled={isRecording || workflowPhase === 'analysis'}
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  style={{
                    flex: 1, background: "transparent", border: "none", color: "white",
                    fontSize: "14px", outline: "none", padding: "4px 8px"
                  }}
                />

                {/* Submit/Next */}
                {!intakeSummary ? (
                  <button
                    onClick={async () => {
                      if (!transcription) return;
                      setIsProcessingIntake(true);
                      try {
                        const res = await fetch("/api/ai/brain", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            messages: [{ role: "user", content: `สรุปและประเมินภาวะร่างกายเบื้องต้นของคนไข้สั้นๆ 2-3 บรรทัดจากคำให้การต่อไปนี้อย่างมีระดับ: ${transcription}` }],
                            engine: "groq"
                          })
                        });
                        const data = await res.json();
                        if (data.content) {
                          setIntakeSummary(data.content);
                        } else {
                          setIntakeSummary(`วิเคราะห์อาการเบื้องต้น: ${transcription}\n(โปรดกดยืนยันเพื่อเริ่มกระบวนการ Mechanistic Analysis)`);
                        }
                      } catch (err) {
                        console.error("Error processing real intake summary:", err);
                        setIntakeSummary(`วิเคราะห์อาการเบื้องต้น: ${transcription}\n(โปรดกดยืนยันเพื่อเริ่มกระบวนการ Mechanistic Analysis)`);
                      } finally {
                        setIsProcessingIntake(false);
                      }
                    }}
                    disabled={!transcription || isProcessingIntake}
                    className="btn btn-success"
                    style={{ borderRadius: "6px", padding: "6px 16px", fontSize: "12px", fontWeight: 600 }}
                  >
                    {isProcessingIntake ? <Loader2 size={14} className="animate-spin" /> : "ประมวลผล"}
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleSaveIntake}
                      disabled={isSaving}
                      style={{ background: "#4F46E5", border: "none", color: "white", fontSize: "12px", padding: "6px 12px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      บันทึกประวัติ
                    </button>
                    <button
                      onClick={() => setWorkflowPhase('analysis')}
                      className="btn btn-primary"
                      style={{ borderRadius: "6px", padding: "6px 16px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      ยืนยัน <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 🧠 Step 2: Neural Analysis Console */}
            <div style={{
              ...card,
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "500px",
              opacity: workflowPhase === 'analysis' ? 1 : 0.5,
              pointerEvents: workflowPhase === 'analysis' ? 'auto' : 'none',
              transition: "all 0.3s"
            }}>

              {/* Chat header */}
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid #E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#FFFFFF", flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#059669" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#1F2937" }}>Neural Analysis Console</div>
                    <div style={{ fontSize: "11px", color: "#6B7280" }}>Precision Reasoning Engine</div>
                  </div>
                </div>

                {activeMission && (
                  <span style={{
                    background: "#E8F0F5", color: "#0A5C8E",
                    fontSize: "11px", fontWeight: 600,
                    padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.3px",
                  }}>
                    MISSION: {activeMission}
                  </span>
                )}
              </div>

              {/* Messages */}
              <div
                style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", background: "#F9FAFB" }}
                className="custom-scrollbar"
              >
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <Brain size={52} style={{ color: "#E5E7EB", marginBottom: "16px" }} />
                    <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "0 0 6px" }}>รอคำสั่งวิเคราะห์จากคุณ</p>
                    <p style={{ fontSize: "12px", color: "#D1D5DB", margin: 0 }}>พิมพ์คำถาม หรือเลือก Mission จากด้านซ้าย</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={idx} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "78%",
                          padding: "12px 16px",
                          background: isUser ? "#0A5C8E" : "#FFFFFF",
                          color: isUser ? "#FFFFFF" : "#1F2937",
                          borderRadius: isUser ? "12px 12px 0 12px" : "12px 12px 12px 0",
                          border: isUser ? "none" : "1px solid #E5E7EB",
                          fontSize: "13px", lineHeight: 1.6,
                        }}>
                          <div style={{
                            fontSize: "10px", fontWeight: 600,
                            color: isUser ? "rgba(255,255,255,0.6)" : "#9CA3AF",
                            letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "6px",
                          }}>
                            {isUser ? "Clinical Inquiry" : "AI Analysis"}
                          </div>
                          <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>

                          {!isUser && (
                            <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => handleSaveAnalysis(msg.content)}
                                style={{
                                  background: "transparent", border: "1px solid #E5E7EB", borderRadius: "4px",
                                  fontSize: "11px", color: "#6B7280", padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px",
                                  cursor: "pointer"
                                }}
                              >
                                <Save size={12} /> บันทึกการรักษานี้
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid #E5E7EB", background: "#FFFFFF", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                    disabled={isAnalyzing}
                    placeholder="พิมพ์คำถามทางคลินิก หรือพารามิเตอร์การวิเคราะห์…"
                    style={{
                      flex: 1, padding: "10px 16px",
                      border: "1px solid #E5E7EB", borderRadius: "6px",
                      background: "#F9FAFB", fontSize: "13px",
                      outline: "none", color: "#1F2937",
                      opacity: isAnalyzing ? 0.6 : 1,
                    }}
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !query.trim()}
                    className="btn btn-primary"
                    style={{
                      padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: isAnalyzing || !query.trim() ? 0.5 : 1,
                      cursor: isAnalyzing || !query.trim() ? "default" : "pointer",
                    }}
                  >
                    {isAnalyzing ? <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={18} />}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#9CA3AF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldCheck size={13} style={{ color: "#059669" }} />
                    End-to-End Encrypted
                  </div>
                  <div>Powered by V-Twin Engine</div>
                </div>
              </div>
            </div>

            {/* 🧬 SYSTEMIC BIOLOGICAL BURDEN Widget */}
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid #E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#FAFAFA"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={15} style={{ color: "#0A5C8E" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", letterSpacing: "0.5px" }}>SYSTEMIC BIOLOGICAL BURDEN</span>
                </div>
                <button
                  onClick={() => {
                    setQuery("วิเคราะห์ภาระชีวภาพรวมของคนไข้รายนี้ตามกรอบ TSPI 39-Axis และประเมินระดับความรุนแรงของแต่ละแกนชีวภาพ");
                    setTimeout(() => handleAnalyze(), 100);
                  }}
                  disabled={isAnalyzing || !selectedPatientId}
                  className="btn btn-primary"
                  style={{
                    fontSize: "11px", padding: "5px 14px",
                    display: "flex", alignItems: "center", gap: "6px",
                    opacity: isAnalyzing || !selectedPatientId ? 0.5 : 1,
                  }}
                >
                  {isAnalyzing
                    ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> กำลังประมวลผล…</>
                    : <><Zap size={13} /> ประมวลผลภาระชีวภาพ</>}
                </button>
              </div>

              <div style={{ padding: "20px" }}>
                {/* Score + Label */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                    {Math.round(axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1))}%
                  </span>
                  <span style={{
                    fontSize: "12px", fontWeight: 600,
                    color: axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1) > 70
                      ? "#EF4444"
                      : axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1) > 40
                        ? "#F59E0B" : "#10B981"
                  }}>
                    {axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1) > 70
                      ? "⚠️ CRITICAL RISK"
                      : axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1) > 40
                        ? "⚡ MODERATE BURDEN" : "✅ OPTIMAL STATE"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ height: "10px", background: "#E5E7EB", borderRadius: "6px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{
                    height: "100%",
                    width: `${axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1)}%`,
                    background: axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1) > 70
                      ? "linear-gradient(90deg, #EF4444, #DC2626)"
                      : axisData.reduce((acc, cur) => acc + (cur.severity || 0), 0) / (axisData.length || 1) > 40
                        ? "linear-gradient(90deg, #F59E0B, #D97706)"
                        : "linear-gradient(90deg, #10B981, #059669)",
                    borderRadius: "6px",
                    transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                </div>

                {/* Axis count info */}
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "20px" }}>
                  {axisData.length > 0
                    ? `คำนวณจาก ${axisData.filter(a => (a.severity || 0) > 0).length} แกนที่มีข้อมูล จากทั้งหมด ${axisData.length} แกน`
                    : "กดปุ่มประมวลผลเพื่อเริ่มการวิเคราะห์"}
                </div>

                {/* Biological Axes List (Detailed breakdown) */}
                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#1F2937", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Zap size={16} style={{ color: "#0A5C8E" }} />
                    DETAILED MECHANISTIC AXES (39-AXIS)
                  </div>
                  <div style={{ maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }} className="custom-scrollbar">
                    <BiologicalHUD axes={axisData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Context Inspector ───────────────────────────────── */}
      {selectedPatientId && (
        <div style={card}>
          <div style={sectionLabel}>Contextual Reasoning Inspector</div>
          <ContextInspector patientId={selectedPatientId} />
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      {showHistoryModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ ...card, width: "600px", maxHeight: "80vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>ประวัติการซักประวัติ</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }} className="custom-scrollbar">
              {historyItems.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9CA3AF", padding: "40px 0" }}>ไม่พบประวัติการซักประวัติ</p>
              ) : (
                historyItems.map((item, idx) => (
                  <div key={idx} style={{ padding: "16px", border: "1px solid #E5E7EB", borderRadius: "8px", background: "#F9FAFB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#0A5C8E" }}>{item.patientName}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#1F2937", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{item.summary}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showSendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ ...card, width: "400px", textAlign: "center", padding: "30px" }}>
            <div style={{ width: "50px", height: "50px", background: "#ECFDF5", color: "#059669", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Share2 size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>ส่งแผนการรักษา</h3>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px", lineHeight: 1.5 }}>
              คุณต้องการบันทึกแผนการรักษานี้ลงในฐานข้อมูลหลัก หรือส่งต่อให้คนไข้ผ่านทาง Patient Portal?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={async () => {
                  if (!selectedPatientId) return;
                  setIsSaving(true);
                  try {
                    const latestMsg = messages.filter(m => m.role === "assistant").pop();
                    await addDoc(collection(db, "tspi_clinical_analyses"), {
                      patientId: selectedPatientId,
                      patientName: patientInfo?.name || "",
                      content: latestMsg?.content || intakeSummary || "",
                      summary: intakeSummary || "",
                      mission: activeMission,
                      type: "emr_record",
                      visibleToPatient: true,
                      source: "ai_physician",
                      timestamp: new Date().toISOString(),
                    });
                    setShowSendModal(false);
                  } catch (err: any) {
                    alert(`บันทึกไม่สำเร็จ: ${err.message}`);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                style={{
                  padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "white",
                  fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Save size={16} />}
                {isSaving ? "กำลังบันทึก..." : "บันทึกเก็บในเวชระเบียน"}
              </button>
              <button
                onClick={async () => {
                  if (!selectedPatientId) return;
                  setIsSaving(true);
                  try {
                    const latestMsg = messages.filter(m => m.role === "assistant").pop();
                    // Save to patient's subcollection for portal access
                    await addDoc(collection(db, "tspi_clinical_analyses"), {
                      patientId: selectedPatientId,
                      patientName: patientInfo?.name || "",
                      content: latestMsg?.content || intakeSummary || "",
                      summary: intakeSummary || "",
                      mission: activeMission,
                      type: "portal_message",
                      visibleToPatient: true,
                      source: "ai_physician",
                      sentToPatient: true,
                      timestamp: new Date().toISOString(),
                    });
                    setShowSendModal(false);
                  } catch (err: any) {
                    alert(`ส่งไม่สำเร็จ: ${err.message}`);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                style={{
                  padding: "12px", borderRadius: "8px", border: "none", background: isSaving ? "#6B7280" : "#0A5C8E", color: "white",
                  fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={16} />}
                {isSaving ? "กำลังส่ง..." : "ส่งให้คนไข้ (Patient Portal)"}
              </button>
              <button onClick={() => setShowSendModal(false)} style={{ marginTop: "10px", color: "#9CA3AF", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px" }}>ไว้ทีหลัง</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .ai-grid { grid-template-columns: 1fr !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>
    </div>
  );
}