"use client";

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Send,
  Mic,
  Circle,
  Paperclip,
  FileText,
  Download,
  X,
  Loader2,
  User,
  Sparkles,
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

import { auth, db } from "@/utils/firebase/client";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function PatientAIIntakePage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "สวัสดีครับ ผมเป็น AI Clinical Assistant ของ TSPI ครับ\n\nวันนี้ผมจะช่วยรวบรวมข้อมูลสุขภาพของคุณ เพื่อประเมิน 39 Biological Axes เบื้องต้นครับ\n\nรบกวนแจ้งอาการที่คุณกังวลในวันนี้ให้ทราบหน่อยครับ?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [findings, setFindings] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 🎙️ Voice Recording Handler
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/m4a" });
        await handleVoiceUpload(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("กรุณาอนุญาตการเข้าถึงไมโครโฟน"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceUpload = async (blob: Blob) => {
    setIsTyping(true);
    const formData = new FormData();
    formData.append("file", blob);
    try {
      const res = await fetch("/api/doctor/voice-to-form", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) {
        setInput(data.text);
        // Auto-send after transcription
        setTimeout(() => handleSend(data.text), 500);
      }
    } catch (err) { console.error(err); }
    finally { setIsTyping(false); }
  };

  // 📸 Lab OCR Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsTyping(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/doctor/lab-ocr", { method: "POST", body: formData });
      const data = await res.json();
      const labContext = `คนไข้ส่งผลแล็บ: ${data.results.map((r:any) => `${r.parameter} ${r.value}${r.unit}`).join(", ")}`;
      handleSend(labContext, true); // Send as context
    } catch (err) { alert("อ่านผลแล็บไม่สำเร็จ"); }
    finally { setIsTyping(false); }
  };

  const handleSend = async (overrideInput?: string, isContext: boolean = false) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;
    
    const userMsg = { role: "user", content: isContext ? "[ระบบได้รับผลแล็บของคุณแล้ว]" : textToSend, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      if (sessionId && auth.currentUser) {
        const sessionRef = doc(db, `patients/${auth.currentUser.uid}/intake_sessions`, sessionId);
        await updateDoc(sessionRef, { messages: arrayUnion({ role: "user", content: textToSend }) });
      }

      const response = await fetch("/api/ai/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: isContext 
            ? [...newMessages.slice(0, -1), { role: "user", content: `(System Context: ${textToSend}) กรุณาวิเคราะห์ผลแล็บนี้และชวนคนไข้คุยต่อ` }]
            : newMessages.map(m => ({ role: m.role, content: m.content })) 
        }),
      });

      const aiData = await response.json();
      let rawContent = aiData.content || "";
      
      // Data extraction logic... (Same as before)
      let extractedData: any = null;
      const jsonMatch = rawContent.match(/\[\[(.*?)\]\]/s);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[1]);
          rawContent = rawContent.replace(/\[\[.*?\]\]/gs, "").trim();
          if (extractedData.scores) setScores(prev => ({ ...prev, ...extractedData.scores }));
          if (extractedData.findings) setFindings(prev => [...new Set([...prev, ...extractedData.findings])]);
        } catch (e) {}
      }

      const aiMsg = { role: "assistant", content: rawContent, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      if (sessionId && auth.currentUser) {
        const sessionRef = doc(db, `patients/${auth.currentUser.uid}/intake_sessions`, sessionId);
        await updateDoc(sessionRef, {
          messages: arrayUnion({ role: "assistant", content: rawContent }),
          currentScores: extractedData?.scores || scores,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) { console.error(error); }
    finally { setIsTyping(false); }
  };

  // Initialize Session in Firestore
  useEffect(() => {
    const initSession = async () => {
      const user = auth.currentUser;
      if (!user || sessionId) return;
      
      const docRef = await addDoc(collection(db, `patients/${user.uid}/intake_sessions`), {
        startedAt: serverTimestamp(),
        status: "active",
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      });
      setSessionId(docRef.id);
    };
    initSession();
  }, [auth.currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="d-flex flex-column h-100 font-kanit bg-secondary-custom overflow-hidden">
      {/* Mini Header... (Same as before) */}
      <div className="bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between shadow-xs">
        <div className="d-flex align-items-center gap-2 text-start">
          <Link href="/patient/dashboard" className="text-muted"><ArrowLeft size={20} /></Link>
          <div className="bg-primary-custom bg-opacity-10 p-2 rounded-3 text-primary-custom">
            <Brain size={18} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 small">AI Clinical Intake</h6>
            <p className="tiny text-muted mb-0">Multimodal Assessment</p>
          </div>
        </div>
      </div>

      {/* Analysis Insights Panel... (Same as before) */}
      <div className="bg-white px-4 py-3 border-bottom shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="tiny fw-bold text-muted uppercase tracking-widest mb-0 d-flex align-items-center gap-2">
            <Sparkles size={14} className="text-primary-custom" /> Analysis Insights
          </h6>
          <span className="tiny text-primary-custom fw-bold">{findings.length} Findings</span>
        </div>
        
        {findings.length > 0 ? (
          <div className="d-flex gap-2 overflow-auto pb-1 no-scrollbar">
            {findings.map((f, i) => (
              <div key={i} className="flex-shrink-0 bg-primary-custom bg-opacity-10 text-primary-custom px-2 py-1 rounded-pill tiny fw-bold border border-primary-custom border-opacity-10">
                {f}
              </div>
            ))}
          </div>
        ) : (
          <p className="tiny text-muted mb-0 italic">เริ่มเล่าอาการหรือส่งผลแล็บให้ AI ช่วยวิเคราะห์...</p>
        )}
      </div>

      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-4 text-start">
        {messages.map((msg, i) => (
          <div key={i} className={`d-flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0 ${msg.role === 'user' ? 'bg-white border' : 'bg-primary-custom'}`} style={{ width: '32px', height: '32px' }}>
              {msg.role === 'user' ? <User size={16} className="text-muted" /> : <Brain size={16} className="text-white" />}
            </div>
            <div className={`p-3 rounded-4 shadow-xs max-w-75 ${msg.role === 'user' ? 'bg-primary-custom text-white rounded-tr-0' : 'bg-white text-dark border rounded-tl-0'}`}>
              <p className="small mb-0 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="d-flex gap-2">
            <div className="bg-white p-3 rounded-4 shadow-xs border rounded-tl-0">
              <Loader2 size={16} className="animate-spin text-primary-custom" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-top pb-safe">
        <div className="d-flex align-items-center gap-2">
           <label className="btn btn-light rounded-circle p-2 text-muted shadow-xs cursor-pointer mb-0">
              <Paperclip size={20} />
              <input type="file" className="d-none" accept="image/*" onChange={handleImageUpload} />
           </label>
           <div className="flex-grow-1 position-relative">
              <input 
                type="text" 
                className="form-control rounded-pill bg-light border-0 py-2.5 ps-4 pe-5 small fw-medium" 
                placeholder="พิมพ์ข้อความ หรือกดไมค์เพื่อพูด..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                className={`position-absolute top-50 end-0 translate-middle-y me-2 btn btn-link p-1 transition-all ${isRecording ? 'animate-pulse text-danger' : 'text-primary-custom'}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic size={20} />
              </button>
           </div>
           <button 
              className={`btn btn-primary-custom rounded-circle p-2.5 shadow-sm transition-all ${!input.trim() ? 'opacity-50' : ''}`}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
           >
              <Send size={20} />
           </button>
        </div>
      </div>
        {isRecording && (
          <div className="text-center mt-2 animate-fade-in">
             <span className="tiny fw-bold text-danger uppercase tracking-widest d-flex align-items-center justify-content-center gap-1">
                <Circle size={8} className="fill-danger" /> Listening... (00:05)
             </span>
          </div>
        )}

        <style jsx>{`
          .bg-primary-custom, .btn-primary-custom { background-color: var(--drpat-primary); color: white; }
          .text-primary-custom { color: var(--drpat-primary); }
          .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
          .leading-relaxed { line-height: 1.6; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
  );
}
