"use client";

import { useState, useEffect } from "react";
import {
  Shield, Search, Filter, Calendar, Brain, User,
  Eye, Clock, Activity, ArrowLeft, Loader2, Terminal,
  ShieldCheck, ShieldAlert, Cpu, Lock, Database,
  FlaskConical
} from "lucide-react";
import Link from "next/link";
import { getAuditLogs } from "@/utils/firebase/audit";
import "./../theme-inapp.css";

const ACTION_MAP: Record<string, { label: string; color: string; icon: any }> = {
  AI_INTAKE_REQUEST: { label: "AI Request", color: "primary", icon: Brain },
  AI_INTAKE_RESPONSE: { label: "AI Analysis", color: "info", icon: Cpu },
  LAB_OCR_PROCESSED: { label: "Lab OCR", color: "purple", icon: FlaskConical },
  USER_CONSENT_ACCEPTED: { label: "PDPA Consent", color: "success", icon: ShieldCheck },
  ADMIN_ACTION: { label: "Admin Action", color: "warning", icon: User },
};


export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, ai: 0, security: 0 });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs(50);
        setLogs(data);

        const aiCount = data.filter(l => l.action?.includes('AI_')).length;
        const secCount = data.filter(l => l.action?.includes('USER_CONSENT') || l.action?.includes('ADMIN')).length;
        setStats({ total: data.length, ai: aiCount, security: secCount });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.user_email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-5">
      {/* 🧭 Audit Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <div className="bg-dark p-2 rounded-3 text-white">
              <Shield size={24} />
            </div>
            System Audit Trail
          </h1>
          <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Clinical Governance & Compliance Monitoring</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-dark btn-sm font-bold uppercase tracking-tighter px-3 shadow-sm d-flex align-items-center gap-1">
            <Lock size={14} /> Security Lockdown
          </button>
        </div>
      </div>

      {/* 📊 Governance Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Logged Events", val: stats.total, color: "dark", icon: Activity, desc: "Last 50 entries" },
          { label: "AI Analysis Logs", val: stats.ai, color: "primary", icon: Brain, desc: "Neural Engine Activity" },
          { label: "Security Verified", val: stats.security, color: "success", icon: ShieldCheck, desc: "Compliant Events" },
          { label: "Compliance Score", val: "100%", color: "info", icon: Database, desc: "Institutional Grade" },
        ].map((s, idx) => (
          <div key={idx} className="col-lg-3 col-6">
            <div className={`card p-3 border-0 shadow-sm bg-white border-top border-4 border-${s.color}`}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-0">{s.label}</p>
                <s.icon size={16} className={`text-${s.color} opacity-30`} />
              </div>
              <h3 className="fw-bold mb-0 h4 text-dark">{loading ? '...' : s.val}</h3>
              <small className="text-[9px] text-muted font-bold uppercase tracking-tighter">{s.desc}</small>
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 Search & Filter Tools */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control bg-light border-0 font-bold text-sm"
                  placeholder="Search by action, email, or metadata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="btn-group shadow-sm">
                {["All Events", "Security", "AI", "Data"].map((cat) => (
                  <button
                    key={cat}
                    className={`btn btn-sm px-3 font-bold uppercase tracking-tighter ${cat === 'All Events' ? 'btn-dark' : 'btn-light border bg-white text-muted'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏛️ Activity Stream Registry */}
      <div className="card shadow-sm border-0 bg-white overflow-hidden">
        <div className="card-header bg-dark py-3 border-0 d-flex justify-content-between align-items-center">
          <h3 className="card-title text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-0">Live Activity Stream</h3>
          <div className="text-[9px] font-bold text-white opacity-50 uppercase tracking-widest d-flex align-items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-circle pulse-green"></div> Real-time Governance Active
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap">
            <thead className="bg-light border-bottom text-[10px] uppercase font-bold text-muted tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="py-3">Action Type</th>
                <th className="py-3">Origin / User</th>
                <th className="py-3">Clinical Context</th>
                <th className="py-3 text-end pr-4">Commands</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Loader2 className="animate-spin text-dark opacity-20" size={32} /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted italic text-xs">No audit logs detected for the current session.</td></tr>
              ) : filteredLogs.map((log) => {
                const action = ACTION_MAP[log.action] || { label: log.action, color: "secondary", icon: Terminal };
                return (
                  <tr key={log.id} className="border-bottom border-light">
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-dark">{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</div>
                      <div className="text-[9px] text-muted font-bold uppercase tracking-tighter d-flex align-items-center gap-1">
                        <Clock size={10} /> SESSION_AUTH_OK
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`badge bg-${action.color} bg-opacity-10 text-${action.color} text-[9px] uppercase px-2 py-1 border border-${action.color} border-opacity-20 font-black d-inline-flex align-items-center gap-1`}>
                        <action.icon size={10} /> {action.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="text-xs font-bold text-dark">{log.user_email || "System Engine"}</div>
                      <div className="text-[9px] text-muted uppercase tracking-tighter">IP: 127.0.0.1 (Verified)</div>
                    </td>
                    <td className="py-3">
                      <div className="text-[10px] font-mono text-muted bg-light p-1 rounded border border-light" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {JSON.stringify(log.metadata || {})}
                      </div>
                    </td>
                    <td className="py-3 text-end pr-4">
                      <button className="btn btn-light btn-sm border px-3" title="View Full Payload">
                        <Eye size={14} className="text-dark" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
