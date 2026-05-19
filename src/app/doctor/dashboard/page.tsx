"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/utils/firebase/client";
import { getDashboardStats, getAllPatients, getAppointments } from "@/utils/firebase/services";
import {
  Users, Layers, Activity, ShieldCheck, Brain,
  CheckCircle, ChevronRight, Calendar, Stethoscope,
  Clock, AlertTriangle, TrendingUp, TrendingDown, Minus
} from "lucide-react";

export default function DoctorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total_patients: 0, urgent_cases: 0, active_now: 0,
    completion_rate: "100%", total_axes: 0, total_modules: 0
  });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/doctor/login");
    });
    const loadData = async () => {
      try {
        const [statsData, patientsData, apptsData] = await Promise.all([
          getDashboardStats(), getAllPatients(),
          getAppointments(new Date().toISOString().split("T")[0]),
        ]);
        setStats(statsData);
        setRecentPatients(patientsData.slice(0, 8));
        setTodayAppointments(apptsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '32px', height: '32px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted text-xs mb-0">Loading Clinical Data...</p>
        </div>
      </div>
    );
  }

  const urgentPercentage = stats.total_patients > 0
    ? ((stats.urgent_cases / stats.total_patients) * 100).toFixed(1)
    : "0";

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="fs-4 fw-semibold mb-1" style={{ color: '#1F2937' }}>
          Clinical Intelligence Center
        </h1>
        <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
          TSPI Precision Medicine OS • Institutional Grade
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="row g-4 mb-6">
        <div className="col-lg-3 col-md-6">
          <div
            className="card p-4 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/doctor/patients')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon" style={{
                width: '44px',
                height: '44px',
                background: '#E8F0F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={22} style={{ color: '#0A5C8E' }} />
              </div>
              <span className="badge bg-gray-50 text-gray-600 text-xs">Active</span>
            </div>
            <h3 className="fs-2 fw-semibold mb-1" style={{ color: '#1F2937' }}>
              {stats.total_patients}
            </h3>
            <p className="text-xs text-muted mb-0">Total Patients</p>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div
            className="card p-4 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/doctor/therapeutic-matrix')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon" style={{
                width: '44px',
                height: '44px',
                background: '#E8F0F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Layers size={22} style={{ color: '#0A5C8E' }} />
              </div>
              <span className="badge bg-gray-50 text-gray-600 text-xs">Active</span>
            </div>
            <h3 className="fs-2 fw-semibold mb-1" style={{ color: '#1F2937' }}>
              {stats.total_modules}
            </h3>
            <p className="text-xs text-muted mb-0">Clinical Modules</p>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div
            className="card p-4 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/doctor/digital-twin')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon" style={{
                width: '44px',
                height: '44px',
                background: '#E8F0F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={22} style={{ color: '#0A5C8E' }} />
              </div>
              <span className="badge bg-gray-50 text-gray-600 text-xs">39 Axes</span>
            </div>
            <h3 className="fs-2 fw-semibold mb-1" style={{ color: '#1F2937' }}>
              {stats.total_axes || 36}
            </h3>
            <p className="text-xs text-muted mb-0">Biological Axes</p>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div
            className="card p-4 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/doctor/audit')}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon" style={{
                width: '44px',
                height: '44px',
                background: '#E8F0F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={22} style={{ color: '#0A5C8E' }} />
              </div>
              <span className="badge bg-success-light text-success text-xs">SECURE</span>
            </div>
            <h3 className="fs-2 fw-semibold mb-1" style={{ color: '#1F2937' }}>
              {stats.completion_rate}
            </h3>
            <p className="text-xs text-muted mb-0">System Completion</p>
          </div>
        </div>
      </div>

      {/* BIOLOGICAL GOVERNANCE */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <Brain size={16} style={{ color: '#0A5C8E' }} />
            <h3 className="mb-0" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
              REAL-TIME BIOLOGICAL GOVERNANCE
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="row align-items-center g-4">
            <div className="col-md-8">
              <div className="d-flex align-items-start gap-3">
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#E8F0F5',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Brain size={24} style={{ color: '#0A5C8E' }} />
                </div>
                <div>
                  <p className="mb-2" style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                    Current biological burden is assessed as
                    <span className="badge bg-success-light text-success ms-2 me-1" style={{ fontWeight: 500 }}>STABLE</span>
                    with urgent cases accounting for
                    <strong style={{ color: '#0A5C8E' }}> {urgentPercentage}%</strong> of total patients.
                  </p>
                  <p className="mb-0 text-xs text-muted">
                    Recommendation: Maintain weekly monitoring intensity for high-risk groups.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border-start border-gray-200 ps-4" style={{ borderLeftWidth: '1px' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <CheckCircle size={14} style={{ color: '#059669' }} />
                  <span className="text-xs font-medium" style={{ color: '#059669' }}>OPTIMIZED</span>
                </div>
                <h3 className="fs-2 fw-semibold mb-0" style={{ color: '#1F2937' }}>
                  {stats.completion_rate}
                </h3>
                <p className="text-xs text-muted mb-0">System Completion Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="row g-6">
        {/* LEFT: Recent Patients */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Activity size={14} style={{ color: '#6B7280' }} />
                <h3 className="mb-0" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
                  RECENT PATIENT ACTIVITY
                </h3>
              </div>
              <Link
                href="/doctor/patients"
                className="text-xs font-medium d-flex align-items-center gap-1"
                style={{ color: '#0A5C8E', textDecoration: 'none' }}
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                      PATIENT
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                      STATUS
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                      PROGRESS
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '48px 16px' }}>
                        <p className="text-muted text-sm mb-0">No active patients found in registry</p>
                      </td>
                    </tr>
                  ) : (
                    recentPatients.map((patient) => {
                      let progressWidth = "20%";
                      let progressColor = "#9CA3AF";
                      let statusBadge = { text: patient.status || "General", color: "#6B7280", bg: "#F3F4F6" };

                      if (patient.status === 'ด่วน' || patient.status === 'เคสด่วน') {
                        progressWidth = "40%";
                        progressColor = "#DC2626";
                        statusBadge = { text: "Urgent", color: "#DC2626", bg: "#FEF2F2" };
                      } else if (patient.status === 'ปกติ') {
                        progressWidth = "85%";
                        progressColor = "#059669";
                        statusBadge = { text: "Stable", color: "#059669", bg: "#ECFDF5" };
                      } else if (patient.status === 'ติดตาม') {
                        progressWidth = "65%";
                        progressColor = "#0A5C8E";
                        statusBadge = { text: "Monitoring", color: "#0A5C8E", bg: "#E8F0F5" };
                      }

                      return (
                        <tr key={patient.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div style={{
                                width: '36px',
                                height: '36px',
                                background: '#F3F4F6',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '12px',
                                color: '#0A5C8E'
                              }}>
                                {patient.fname?.[0]}{patient.lname?.[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: '14px', color: '#1F2937' }}>
                                  {patient.fname} {patient.lname}
                                </div>
                                <div style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.3px' }}>
                                  HN: {patient.hn || patient.id?.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge" style={{
                              background: statusBadge.bg,
                              color: statusBadge.color,
                              fontSize: '10px',
                              fontWeight: 500,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ width: '120px' }}>
                              <div style={{
                                height: '4px',
                                background: '#E5E7EB',
                                borderRadius: '2px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: progressWidth,
                                  height: '100%',
                                  background: progressColor,
                                  borderRadius: '2px'
                                }} />
                              </div>
                              <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '4px' }}>
                                {progressWidth} Analyzed
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <Link
                              href={`/doctor/patients/${patient.id}`}
                              className="btn btn-outline"
                              style={{
                                fontSize: '10px',
                                padding: '4px 12px',
                                fontWeight: 500,
                                letterSpacing: '0.3px'
                              }}
                            >
                              REVIEW
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Today's Appointments */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={14} style={{ color: '#6B7280' }} />
                <h3 className="mb-0" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', letterSpacing: '0.3px' }}>
                  TODAY'S SCHEDULE
                </h3>
              </div>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-5 text-center">
                <Calendar size={40} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
                <p className="text-muted text-sm mb-0">No appointments scheduled for today</p>
              </div>
            ) : (
              <div>
                {todayAppointments.map((apt, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      borderBottom: idx === todayAppointments.length - 1 ? 'none' : '1px solid #F3F4F6'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span style={{ fontWeight: 500, fontSize: '14px', color: '#1F2937' }}>
                        {apt.name || "Unknown Patient"}
                      </span>
                      <span className="badge" style={{
                        background: apt.status === 'ด่วน' ? '#FEF2F2' : '#FFFBEB',
                        color: apt.status === 'ด่วน' ? '#DC2626' : '#D97706',
                        fontSize: '10px',
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {apt.time} น.
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Stethoscope size={12} style={{ color: '#9CA3AF' }} />
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        {apt.type || "General Consultation"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card-footer" style={{ textAlign: 'center' }}>
              <Link
                href="/doctor/appointments"
                className="text-xs font-medium d-flex align-items-center justify-content-center gap-1"
                style={{ color: '#6B7280', textDecoration: 'none' }}
              >
                Manage All Schedule <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}