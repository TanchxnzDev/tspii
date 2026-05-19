"use client";

import { useState } from "react";
import {
  FileText, Upload, Layers, Thermometer, Activity,
  Shield, Database, Info, CheckCircle, AlertCircle,
  Zap, Sparkles, RefreshCw, Loader2, Microscope,
  FlaskConical, ClipboardCheck, Brain, Scan, X
} from "lucide-react";
import Link from "next/link";

export default function LabReviewPage() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [labData, setLabData] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    // Simulate V-Twin Engine Analysis
    setTimeout(() => {
      setLabData({
        markers: [
          { name: "GLUCOSE", value: "160", unit: "mg/dL", flag: "HIGH", reference: "70-99", color: "#DC2626", bg: "#FEF2F2" },
          { name: "HbA1C", value: "7.5", unit: "%", flag: "HIGH", reference: "<5.7", color: "#DC2626", bg: "#FEF2F2" },
          { name: "LDL", value: "195", unit: "mg/dL", flag: "HIGH", reference: "<100", color: "#DC2626", bg: "#FEF2F2" },
          { name: "ALT", value: "42", unit: "U/L", flag: "NORMAL", reference: "10-40", color: "#059669", bg: "#ECFDF5" },
          { name: "HDL", value: "45", unit: "mg/dL", flag: "NORMAL", reference: ">40", color: "#059669", bg: "#ECFDF5" },
          { name: "TRIG", value: "180", unit: "mg/dL", flag: "BORDERLINE", reference: "<150", color: "#D97706", bg: "#FFFBEB" },
        ],
        axes: [
          { id: "D1", name: "Immune Response", domain: "Immunity", score: 0.8 },
          { id: "D3", name: "Metabolic Pathway", domain: "Metabolism", score: 0.9 },
          { id: "D12", name: "Lipid Oxidation", domain: "Oxidation", score: 0.75 },
        ],
        summary: "Metabolic dysregulation detected. Elevated glucose and HbA1c indicate insulin resistance. Lipid profile shows elevated LDL requiring intervention."
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleClear = () => {
    setInput("");
    setLabData(null);
  };

  const getFlagStyle = (flag: string) => {
    switch (flag) {
      case "HIGH":
        return { background: "#FEF2F2", color: "#DC2626", label: "HIGH" };
      case "LOW":
        return { background: "#FFFBEB", color: "#D97706", label: "LOW" };
      case "NORMAL":
        return { background: "#ECFDF5", color: "#059669", label: "NORMAL" };
      case "BORDERLINE":
        return { background: "#FFFBEB", color: "#D97706", label: "BORDERLINE" };
      default:
        return { background: "#F3F4F6", color: "#6B7280", label: flag };
    }
  };

  return (
    <div>
      {/* ==================== HEADER ==================== */}
      <div className="d-flex justify-content-between align-items-center mb-6">
        <div>
          <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
            Lab Results Review
          </h1>
          <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
            Biomarker Intelligence & Mechanistic Mapping
          </p>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }}>
          <Database size={14} className="me-1" /> Clinical Records
        </button>
      </div>

      <div className="row g-6">
        {/* ==================== LEFT COLUMN: INPUT ==================== */}
        <div className="col-lg-5">
          <div className="card mb-6">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                RAW DATA INPUT
              </h3>
              <button className="btn btn-outline" style={{ fontSize: '10px', padding: '4px 10px' }}>
                <Scan size={12} className="me-1" /> SCAN IMAGE
              </button>
            </div>
            <div className="p-4">
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                Clinical Observations / Lab Text
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  background: '#F9FAFB'
                }}
                rows={12}
                placeholder="Paste lab results text here...&#10;&#10;Example:&#10;Glucose: 160 mg/dL&#10;HbA1C: 7.5%&#10;LDL: 195 mg/dL&#10;ALT: 42 U/L"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="d-flex gap-3 mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isProcessing || !input.trim()}
                  className="btn btn-primary flex-grow-1"
                  style={{ fontSize: '12px', padding: '10px' }}
                >
                  {isProcessing ? (
                    <><Loader2 size={14} className="me-2 spinner-border" style={{ animationDuration: '1s' }} /> PROCESSING...</>
                  ) : (
                    <><Zap size={14} className="me-2" /> ANALYZE & MAP TO AXES</>
                  )}
                </button>
                {input && !isProcessing && (
                  <button
                    onClick={handleClear}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '10px 16px' }}
                  >
                    <X size={14} />
                  </button>
                )}
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
                    V-TWIN INTELLIGENCE
                  </h6>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                    The V-Twin Engine automatically extracts clinical markers, compares with institutional standards, and identifies biological outliers in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: OUTPUT ==================== */}
        <div className="col-lg-7">
          {!labData && !isProcessing ? (
            // Empty State
            <div className="card text-center py-5" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ marginBottom: '20px' }}>
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
                  <Microscope size={40} style={{ color: '#D1D5DB' }} />
                </div>
                <h4 style={{ fontWeight: 500, fontSize: '16px', color: '#1F2937', marginBottom: '8px' }}>
                  Awaiting Data Processing
                </h4>
                <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '280px', margin: '0 auto' }}>
                  Input raw lab data on the left and click analyze to generate clinical insights.
                </p>
              </div>
            </div>
          ) : isProcessing ? (
            // Loading State
            <div className="card text-center py-5" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div className="spinner-border text-primary mb-4" role="status" style={{ width: '48px', height: '48px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 style={{ fontWeight: 500, fontSize: '14px', color: '#1F2937', marginBottom: '4px' }}>
                  Processing Intelligence
                </h5>
                <p style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.3px' }}>
                  Connecting to V-Twin Mechanistic Core...
                </p>
              </div>
            </div>
          ) : (
            // Results State
            <div>
              {/* Biomarker Profile Table */}
              <div className="card mb-6">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                    EXTRACTED BIOMARKER PROFILE
                  </h3>
                  <span className="badge" style={{
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '9px',
                    fontWeight: 500,
                    padding: '2px 8px'
                  }}>
                    Verified by V-Twin
                  </span>
                </div>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                          CLINICAL MARKER
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                          RESULT
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                          REFERENCE
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {labData.markers.map((marker: any, idx: number) => {
                        const flagStyle = getFlagStyle(marker.flag);
                        return (
                          <tr key={idx} style={{ borderBottom: idx === labData.markers.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 500, fontSize: '13px', color: '#1F2937' }}>
                                {marker.name}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                                {marker.value}
                              </span>
                              <span style={{ fontSize: '10px', color: '#9CA3AF', marginLeft: '4px' }}>
                                {marker.unit}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                                {marker.reference}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span className="badge" style={{
                                background: flagStyle.background,
                                color: flagStyle.color,
                                fontSize: '9px',
                                fontWeight: 600,
                                padding: '3px 10px'
                              }}>
                                {flagStyle.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clinical Summary */}
              <div className="card mb-6" style={{ background: '#F9FAFB' }}>
                <div className="p-4">
                  <div className="d-flex align-items-start gap-3">
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: '#E8F0F5',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertCircle size={16} style={{ color: '#0A5C8E' }} />
                    </div>
                    <div>
                      <h6 style={{ fontWeight: 600, fontSize: '11px', color: '#0A5C8E', marginBottom: '6px', letterSpacing: '0.3px' }}>
                        CLINICAL SUMMARY
                      </h6>
                      <p style={{ fontSize: '13px', color: '#1F2937', margin: 0, lineHeight: 1.5 }}>
                        {labData.summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biological Impact Mapping */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center gap-2">
                    <Brain size={14} style={{ color: '#6B7280' }} />
                    <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                      BIOLOGICAL IMPACT MAPPING
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="row g-4">
                    {labData.axes.map((axis: any, idx: number) => (
                      <div key={idx} className="col-md-4">
                        <div style={{
                          padding: '14px',
                          background: '#F9FAFB',
                          borderRadius: '6px',
                          border: '1px solid #F3F4F6'
                        }}>
                          <div style={{ fontSize: '9px', fontWeight: 600, color: '#0A5C8E', letterSpacing: '0.3px', marginBottom: '8px' }}>
                            {axis.id}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937', marginBottom: '12px' }}>
                            {axis.name}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{
                              height: '4px',
                              background: '#E5E7EB',
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${axis.score * 100}%`,
                                height: '100%',
                                background: '#0A5C8E',
                                borderRadius: '2px'
                              }} />
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span style={{ fontSize: '9px', color: '#9CA3AF' }}>Relevance</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#1F2937' }}>
                              {(axis.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-4 pt-2">
                    <button className="btn btn-primary" style={{ fontSize: '11px', padding: '8px 20px' }}>
                      <Activity size={14} className="me-2" /> Sync to Digital Twin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}