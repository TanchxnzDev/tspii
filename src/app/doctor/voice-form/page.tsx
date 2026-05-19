"use client";

import { useState, useRef, useEffect } from "react";
import {
  Mic, MicOff, Upload, Play, Pause, Loader2, Save,
  Volume2, Sparkles, CheckCircle, Info, FileText,
  StopCircle, History, MessageSquare, Brain,
  ChevronRight, ClipboardCheck, Activity, ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function VoiceFormPage() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"soap" | "detail">("soap");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recording]);

  const handleStartStop = () => {
    if (!recording) {
      setRecording(true);
      setDuration(0);
      setResult(null);
    } else {
      setRecording(false);
      setProcessing(true);
      // Simulate Neural Transcription
      setTimeout(() => {
        setResult({
          transcript: "Patient reports insomnia for 2 weeks, feeling fatigued in the afternoon. No fever. Physical examination normal. Recommend sleep schedule adjustment and Magnesium supplementation.",
          soap: {
            S: "Insomnia for 2 weeks, fatigue in the afternoon",
            O: "Physical examination: Normal, no fever, vital signs stable",
            A: "Sleep cycle disruption, possible mineral deficiency",
            P: "Sleep hygiene education, Magnesium supplementation, Follow-up in 2 weeks",
            axes: ["D3 (Metabolic)", "D1 (Immune)", "D9 (Neurological)"]
          }
        });
        setProcessing(false);
      }, 1500);
    }
  };

  const formatDuration = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div>
      {/* ==================== HEADER ==================== */}
      <div className="d-flex justify-content-between align-items-center mb-6">
        <div>
          <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
            Voice Clinical Note
          </h1>
          <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
            AI-Powered Transcription & SOAP Generation
          </p>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }}>
          <History size={14} className="me-1" /> Voice Archive
        </button>
      </div>

      <div className="row g-6">
        {/* ==================== LEFT COLUMN: RECORDING ==================== */}
        <div className="col-lg-5">
          <div className="card mb-6">
            <div className="card-header text-center">
              <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                CLINICAL RECORDING STATION
              </h3>
            </div>
            <div className="p-5 text-center">
              {/* Record Button */}
              <div className="mb-4">
                <button
                  onClick={handleStartStop}
                  className="btn"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: recording ? '#DC2626' : '#0A5C8E',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: recording ? '0 0 0 4px #FEF2F2' : 'none',
                    animation: recording ? 'pulseGlow 2s infinite' : 'none'
                  }}
                >
                  {recording ? <StopCircle size={48} /> : <Mic size={48} />}
                </button>
              </div>

              {/* Timer */}
              <div className="mb-4">
                <h1 style={{
                  fontWeight: 700,
                  fontSize: '48px',
                  fontFamily: 'monospace',
                  color: recording ? '#DC2626' : '#1F2937',
                  marginBottom: '8px'
                }}>
                  {formatDuration(duration)}
                </h1>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  {recording && (
                    <div style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%' }} />
                  )}
                  <p style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.3px', margin: 0 }}>
                    {recording ? "Capturing Audio..." : "Ready for Clinical Session"}
                  </p>
                </div>
              </div>

              {/* Upload Buttons */}
              <div className="d-grid gap-2">
                <button className="btn btn-outline w-100" style={{ fontSize: '10px', padding: '8px' }}>
                  <Upload size={14} className="me-2" /> Upload Audio Protocol
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '9px', padding: '6px' }}>
                  Manual Transcription Override
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card" style={{ background: '#F9FAFB' }}>
            <div className="p-4">
              <div className="d-flex align-items-start gap-3">
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#E8F0F5',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={14} style={{ color: '#0A5C8E' }} />
                </div>
                <div>
                  <h6 style={{ fontWeight: 600, fontSize: '11px', color: '#0A5C8E', marginBottom: '4px', letterSpacing: '0.3px' }}>
                    INTELLIGENT MAPPING
                  </h6>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                    TSPI Voice Engine automatically identifies clinical markers and structures them into a Standard SOAP format with high diagnostic accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: OUTPUT ==================== */}
        <div className="col-lg-7">
          {!result && !processing ? (
            // Empty State
            <div className="card text-center py-5" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Brain size={40} style={{ color: '#D1D5DB' }} />
                </div>
                <h4 style={{ fontWeight: 500, fontSize: '16px', color: '#1F2937', marginBottom: '8px' }}>
                  Neural Output Terminal
                </h4>
                <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '280px', margin: '0 auto' }}>
                  Start recording or upload a consultation audio to generate an AI-powered clinical summary.
                </p>
              </div>
            </div>
          ) : processing ? (
            // Loading State
            <div className="card text-center py-5" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div className="position-relative mb-4">
                  <div className="spinner-border text-primary" role="status" style={{ width: '64px', height: '64px' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <Brain size={24} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#0A5C8E'
                  }} />
                </div>
                <h5 style={{ fontWeight: 500, fontSize: '14px', color: '#1F2937', marginBottom: '4px' }}>
                  Generating SOAP Note
                </h5>
                <p style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.3px' }}>
                  Applying mechanistic logic to audio input...
                </p>
              </div>
            </div>
          ) : (
            // Results State
            <div>
              {/* Transcript Card */}
              <div className="card mb-6">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ background: '#1F2937' }}>
                  <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>
                    ORIGINAL TRANSCRIPT
                  </h3>
                  <span className="badge" style={{
                    background: '#E8F0F5',
                    color: '#0A5C8E',
                    fontSize: '9px',
                    fontWeight: 500,
                    padding: '2px 8px'
                  }}>
                    Quality: High
                  </span>
                </div>
                <div className="p-4" style={{ background: '#F9FAFB' }}>
                  <p style={{ fontSize: '13px', color: '#1F2937', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{result.transcript}"
                  </p>
                </div>
              </div>

              {/* SOAP Analysis Card */}
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <ClipboardCheck size={14} style={{ color: '#6B7280' }} />
                    <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                      STRUCTURED SOAP ANALYSIS
                    </h3>
                  </div>
                  <button className="btn btn-primary" style={{ fontSize: '10px', padding: '4px 12px' }}>
                    <Save size={12} className="me-1" /> Commit to Record
                  </button>
                </div>
                <div className="p-4">
                  <div className="row g-3">
                    {[
                      { key: "S", label: "Subjective", content: result.soap.S, color: "#0A5C8E", bg: "#E8F0F5" },
                      { key: "O", label: "Objective", content: result.soap.O, color: "#059669", bg: "#ECFDF5" },
                      { key: "A", label: "Assessment", content: result.soap.A, color: "#D97706", bg: "#FFFBEB" },
                      { key: "P", label: "Plan", content: result.soap.P, color: "#6B7280", bg: "#F3F4F6" },
                    ].map((section) => (
                      <div key={section.key} className="col-12">
                        <div style={{
                          padding: '14px',
                          background: section.bg,
                          borderRadius: '6px',
                          borderLeft: `3px solid ${section.color}`
                        }}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span style={{ fontWeight: 700, fontSize: '13px', color: section.color }}>
                              {section.key}
                            </span>
                            <span style={{ fontSize: '10px', color: '#6B7280' }}>
                              {section.label}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#1F2937', margin: 0, lineHeight: 1.5 }}>
                            {section.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Impacted Axes */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <h6 style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px', marginBottom: '12px' }}>
                      IMPACTED BIOLOGICAL AXES
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {result.soap.axes.map((axis: string, idx: number) => (
                        <span key={idx} className="badge" style={{
                          background: '#F3F4F6',
                          color: '#374151',
                          fontSize: '10px',
                          fontWeight: 500,
                          padding: '4px 12px'
                        }}>
                          {axis}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
      `}</style>
    </div>
  );
}