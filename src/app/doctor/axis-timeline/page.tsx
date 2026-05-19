"use client";

import { useState, useEffect, Suspense } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, Search, RefreshCw, User, AlertTriangle,
  CheckCircle, Activity, ChevronDown, ChevronUp, Clock,
  LayoutGrid, Users, Calendar, Filter, Share2, Download,
  X
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { medicalDb } from "@/lib/medical-data";
import Link from "next/link";

function AxisTimelineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientIdFromUrl = searchParams.get("id");

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientIdFromUrl);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  useEffect(() => {
    setIsClient(true);
    const loadInitialData = async () => {
      try {
        const pList = await medicalDb.getPatientList();
        setPatients(pList);
        if (patientIdFromUrl) {
          await handleSelectPatient(patientIdFromUrl);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setLoading(false);
      }
    };
    loadInitialData();
  }, [patientIdFromUrl]);

  const handleSelectPatient = async (id: string) => {
    setLoading(true);
    setSelectedPatientId(id);
    setShowPatientSearch(false);

    try {
      const info = await medicalDb.getPatient(id);
      setPatientInfo(info);

      const mockRealData = [
        { date: "01 Mar 2024", burden: 82, D1: 85, D3: 70, D5: 60 },
        { date: "15 Mar 2024", burden: 75, D1: 80, D3: 65, D5: 62 },
        { date: "01 Apr 2024", burden: 68, D1: 72, D3: 58, D5: 55 },
        { date: "Today", burden: info?.healthScore || 62, D1: 65, D3: 50, D5: 48 },
      ];
      setTimelineData(mockRealData);
      router.push(`/doctor/axis-timeline?id=${id}`);
    } catch (err) {
      console.error("Error loading patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    (p.fname || p.name || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.hn || "").toLowerCase().includes(patientSearch.toLowerCase())
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card" style={{ minWidth: '200px' }}>
          <div className="card-header" style={{ padding: '8px 12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
              {label}
            </span>
          </div>
          <div className="p-3">
            {payload.map((p: any, i: number) => (
              <div key={i} className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: p.color }} />
                  <span style={{ fontSize: '11px', color: '#4B5563' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1F2937' }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !isClient) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '32px', height: '32px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted text-xs mb-0">Loading timeline data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ==================== HEADER ==================== */}
      <div className="d-flex justify-content-between align-items-center mb-6">
        <div>
          <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
            Biological Timeline
          </h1>
          <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
            Longitudinal Data Analysis & Health Trends
          </p>
        </div>
        <div className="position-relative">
          <button
            onClick={() => setShowPatientSearch(!showPatientSearch)}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <Users size={14} className="me-1" />
            {patientInfo?.name || "Select Patient"}
          </button>

          {/* Patient Search Dropdown */}
          {showPatientSearch && (
            <div
              className="card position-absolute end-0 top-100 mt-2"
              style={{ width: '320px', zIndex: 1000 }}
            >
              <div className="p-3 border-bottom" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                    SELECT PATIENT
                  </span>
                  <button
                    onClick={() => setShowPatientSearch(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={14} style={{ color: '#9CA3AF' }} />
                  </button>
                </div>
                <div className="search-bar" style={{ width: '100%' }}>
                  <Search size={14} style={{ color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Search by name or HN..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredPatients.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted text-xs mb-0">No patients found</p>
                  </div>
                ) : (
                  filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid #F3F4F6',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: '#E8F0F5',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: '#0A5C8E'
                      }}>
                        {(p.fname || p.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '13px', color: '#1F2937' }}>
                          {p.fname || p.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.3px' }}>
                          HN: {p.hn || p.id?.slice(0, 8)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        /* ==================== NO PATIENT SELECTED ==================== */
        <div className="card text-center py-5 my-4">
          <div style={{ marginBottom: '24px' }}>
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
              <Clock size={40} style={{ color: '#D1D5DB' }} />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: '18px', color: '#1F2937', marginBottom: '8px' }}>
              No Timeline Data Selected
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>
              Select a patient to visualize their longitudinal health journey and mechanistic trend analysis.
            </p>
          </div>
          <div>
            <button onClick={() => setShowPatientSearch(true)} className="btn btn-primary">
              Open Patient Registry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ==================== METRICS SUMMARY ==================== */}
          <div className="row g-4 mb-6">
            {[
              { label: "Current Burden", value: `${patientInfo?.healthScore || 62}%`, trend: "-12%", trendColor: "#059669", icon: Activity },
              { label: "Optimal State", value: "85%", trend: "Stable", trendColor: "#059669", icon: CheckCircle },
              { label: "Data Points", value: timelineData.length, trend: "+1 New", trendColor: "#0A5C8E", icon: LayoutGrid },
              { label: "Risk Index", value: "Low", trend: "Decreasing", trendColor: "#059669", icon: TrendingUp },
            ].map((stat, idx) => (
              <div key={idx} className="col-lg-3 col-md-6">
                <div className="card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px', marginBottom: '4px' }}>
                        {stat.label}
                      </p>
                      <h3 style={{ fontWeight: 600, fontSize: '24px', color: '#1F2937', margin: 0 }}>
                        {stat.value}
                      </h3>
                      <span style={{ fontSize: '10px', fontWeight: 500, color: stat.trendColor }}>
                        {stat.trend}
                      </span>
                    </div>
                    <stat.icon size={20} style={{ color: '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ==================== MAIN CHART ==================== */}
          <div className="card mb-6">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={14} style={{ color: '#6B7280' }} />
                <h3 className="mb-0" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
                  BIOLOGICAL HISTORY VISUALIZATION
                </h3>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline" style={{ fontSize: '10px', padding: '4px 10px' }}>
                  <Download size={12} className="me-1" /> Export
                </button>
                <button className="btn btn-outline" style={{ fontSize: '10px', padding: '4px 10px' }}>
                  <Share2 size={12} className="me-1" /> Share
                </button>
              </div>
            </div>
            <div className="p-4" style={{ height: '450px' }}>
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorBurden" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A5C8E" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0A5C8E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 500, fill: '#6B7280' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 500, fill: '#6B7280' }}
                      domain={[0, 100]}
                      label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#6B7280' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', fontWeight: 500, marginBottom: '16px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="burden"
                      name="Disease Burden"
                      stroke="#0A5C8E"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBurden)"
                    />
                    <Line
                      type="monotone"
                      dataKey="D1"
                      name="Metabolic Axis"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="D3"
                      name="Immune Axis"
                      stroke="#D97706"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="D5"
                      name="Neurological Axis"
                      stroke="#6B7280"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ==================== BOTTOM TWO COLUMNS ==================== */}
          <div className="row g-6">
            {/* Analysis Logs */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
                    ANALYSIS LOGS
                  </h3>
                </div>
                <div>
                  {[
                    { event: "Oxidative Stress Peak", date: "01 Mar 2024", status: "Critical", statusColor: "#DC2626", statusBg: "#FEF2F2" },
                    { event: "Metabolic Stabilization", date: "15 Mar 2024", status: "Improving", statusColor: "#059669", statusBg: "#ECFDF5" },
                    { event: "Dietary Intervention Alpha", date: "01 Apr 2024", status: "Active", statusColor: "#0A5C8E", statusBg: "#E8F0F5" },
                  ].map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 20px',
                        borderBottom: idx === 2 ? 'none' : '1px solid #F3F4F6'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13px', color: '#1F2937', marginBottom: '2px' }}>
                          {log.event}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                          {log.date}
                        </div>
                      </div>
                      <span className="badge" style={{
                        background: log.statusBg,
                        color: log.statusColor,
                        fontSize: '9px',
                        fontWeight: 600,
                        padding: '3px 10px'
                      }}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Metadata */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
                    TIMELINE METADATA
                  </h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div style={{
                      padding: '14px',
                      background: '#F9FAFB',
                      borderRadius: '6px',
                      border: '1px solid #F3F4F6'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px', marginBottom: '4px' }}>
                        OBSERVATION PERIOD
                      </div>
                      <div style={{ fontWeight: 500, fontSize: '13px', color: '#1F2937' }}>
                        Mar 2024 - Present (92 Days)
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{
                      padding: '14px',
                      background: '#F9FAFB',
                      borderRadius: '6px',
                      border: '1px solid #F3F4F6'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px', marginBottom: '4px' }}>
                        CONFIDENCE SCORE
                      </div>
                      <div style={{ fontWeight: 500, fontSize: '13px', color: '#059669' }}>
                        High (Bayesian Stability: 0.94)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AxisTimelinePage() {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '32px', height: '32px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted text-xs mb-0">Loading timeline...</p>
        </div>
      </div>
    }>
      <AxisTimelineContent />
    </Suspense>
  );
}