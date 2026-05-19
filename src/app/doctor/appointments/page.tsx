"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Clock, RefreshCw, Plus,
  Check, Stethoscope, X,
  CalendarDays, CheckCircle2,
  Brain
} from "lucide-react";
import Link from "next/link";
import { getAppointments, updateAppointment } from "@/utils/firebase/services";

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "ยืนยันแล้ว": { label: "Confirmed", color: "#059669", bg: "#ECFDF5" },
  "Confirmed": { label: "Confirmed", color: "#059669", bg: "#ECFDF5" },
  "รอยืนยัน": { label: "Pending", color: "#D97706", bg: "#FFFBEB" },
  "Pending": { label: "Pending", color: "#D97706", bg: "#FFFBEB" },
  "เสร็จสิ้น": { label: "Completed", color: "#6B7280", bg: "#F3F4F6" },
  "Completed": { label: "Completed", color: "#6B7280", bg: "#F3F4F6" },
  "ยกเลิก": { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
  "Cancelled": { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
};

export default function DoctorAppointments() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppts = async () => {
      setLoading(true);
      try {
        const data = await getAppointments(selectedDate);
        setAppointments(data);
      } catch (err) {
        console.error("Error loading appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAppts();
  }, [selectedDate]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointment(id, { status: newStatus });
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppts = appointments.filter(a => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "confirmed") return a.status === "ยืนยันแล้ว" || a.status === "Confirmed";
    if (selectedStatus === "pending") return a.status === "รอยืนยัน" || a.status === "Pending";
    if (selectedStatus === "completed") return a.status === "เสร็จสิ้น" || a.status === "Completed";
    if (selectedStatus === "cancelled") return a.status === "ยกเลิก" || a.status === "Cancelled";
    return true;
  });

  const statusCounts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === "ยืนยันแล้ว" || a.status === "Confirmed").length,
    pending: appointments.filter(a => a.status === "รอยืนยัน" || a.status === "Pending").length,
    completed: appointments.filter(a => a.status === "เสร็จสิ้น" || a.status === "Completed").length,
    cancelled: appointments.filter(a => a.status === "ยกเลิก" || a.status === "Cancelled").length,
  };

  const statusFilters = [
    { id: "all", label: "All Appointments", count: statusCounts.all },
    { id: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "completed", label: "Completed", count: statusCounts.completed },
    { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

  return (
    <div>
      {/* ==================== HEADER ==================== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1F2937', marginBottom: '4px' }}>
            Clinical Schedule
          </h1>
          <p style={{ fontSize: '12px', color: '#6B7280', letterSpacing: '0.3px', margin: 0 }}>
            Patient Consultation & Appointment Management
          </p>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>
          <Plus size={14} style={{ marginRight: '6px' }} /> New Appointment
        </button>
      </div>

      {/* ==================== LAYOUT ==================== */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ==================== LEFT SIDEBAR ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Date Picker */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                SCHEDULE CONTROLS
              </span>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                Observation Date
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
                background: '#F9FAFB',
                padding: '7px 12px',
                gap: '8px'
              }}>
                <CalendarDays size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <input
                  type="date"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    outline: 'none',
                    flex: 1,
                    color: '#1F2937'
                  }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                STATUS PIPELINE
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {statusFilters.map((s) => {
                const active = selectedStatus === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStatus(s.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 10px',
                      background: active ? '#E8F0F5' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: active ? 500 : 400,
                      color: active ? '#0A5C8E' : '#4B5563',
                    }}>
                      {s.label}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: active ? '#0A5C8E' : '#9CA3AF',
                    }}>
                      {s.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Efficiency Insight */}
          <div className="card" style={{ background: '#F9FAFB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Clock size={13} style={{ color: '#0A5C8E' }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#0A5C8E', letterSpacing: '0.3px' }}>
                EFFICIENCY INSIGHT
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
              Confirming appointments 24 hours in advance increases clinic throughput by an estimated 15%.
            </p>
          </div>
        </div>

        {/* ==================== RIGHT: MAIN TABLE ==================== */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
              CONSULTATION QUEUE ({filteredAppts.length})
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="btn btn-outline"
                style={{ fontSize: '11px', padding: '5px 12px' }}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(prev => prev)} // triggers re-fetch via useEffect
                className="btn btn-outline"
                style={{ padding: '5px 9px' }}
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {["TIME", "PATIENT", "SERVICE", "STATUS", "ACTIONS"].map((col, i) => (
                    <th
                      key={col}
                      style={{
                        padding: '11px 16px',
                        textAlign: i === 3 ? 'center' : i === 4 ? 'right' : 'left',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6B7280',
                        letterSpacing: '0.3px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '56px 16px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        border: '2px solid #E5E7EB',
                        borderTopColor: '#0A5C8E',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                        margin: '0 auto'
                      }} />
                    </td>
                  </tr>
                ) : filteredAppts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '56px 16px' }}>
                      <Calendar size={36} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
                      <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                        No appointments scheduled
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAppts.map((appt) => {
                    const sc = STATUS_CONFIG[appt.status] ?? { label: appt.status || "Unknown", color: "#6B7280", bg: "#F3F4F6" };
                    const isPending = appt.status === "รอยืนยัน" || appt.status === "Pending";
                    const isConfirmed = appt.status === "ยืนยันแล้ว" || appt.status === "Confirmed";
                    const isDone = appt.status === "เสร็จสิ้น" || appt.status === "Completed";
                    const isCancelled = appt.status === "ยกเลิก" || appt.status === "Cancelled";

                    return (
                      <tr
                        key={appt.id}
                        style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* TIME */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} style={{ color: '#9CA3AF' }} />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                              {appt.time || "09:00"}
                            </span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '3px', paddingLeft: '18px' }}>
                            30 MIN
                          </div>
                        </td>

                        {/* PATIENT */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              background: '#E8F0F5',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '13px',
                              color: '#0A5C8E',
                              flexShrink: 0
                            }}>
                              {(appt.patient_name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '14px', color: '#1F2937' }}>
                                {appt.patient_name || "Unknown Patient"}
                              </div>
                              <div style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.2px', marginTop: '1px' }}>
                                HN: {appt.patient_hn || "TSPI-001"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SERVICE */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Stethoscope size={11} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: '#4B5563' }}>
                              {appt.type || "General Consultation"}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: sc.bg,
                            color: sc.color,
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '3px 10px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            {sc.label}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            {/* AI Analysis */}
                            <Link
                              href={`/doctor/ai-physician?id=${appt.patient_id}`}
                              className="btn btn-ghost"
                              style={{ padding: '5px 8px' }}
                              title="AI Analysis"
                            >
                              <Brain size={15} style={{ color: '#0A5C8E' }} />
                            </Link>

                            {/* Confirm (Pending only) */}
                            {isPending && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "ยืนยันแล้ว")}
                                className="btn btn-ghost"
                                style={{ padding: '5px 8px' }}
                                title="Confirm"
                              >
                                <Check size={15} style={{ color: '#059669' }} />
                              </button>
                            )}

                            {/* Complete (Confirmed only) */}
                            {isConfirmed && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "เสร็จสิ้น")}
                                className="btn btn-ghost"
                                style={{ padding: '5px 8px' }}
                                title="Mark Complete"
                              >
                                <CheckCircle2 size={15} style={{ color: '#0A5C8E' }} />
                              </button>
                            )}

                            {/* Cancel (not done/cancelled) */}
                            {!isDone && !isCancelled && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "ยกเลิก")}
                                className="btn btn-ghost"
                                style={{ padding: '5px 8px' }}
                                title="Cancel"
                              >
                                <X size={15} style={{ color: '#DC2626' }} />
                              </button>
                            )}
                          </div>
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

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .appt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}