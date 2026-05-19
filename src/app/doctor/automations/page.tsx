"use client";

import { useState, useEffect } from "react";
import {
  Cpu, MessageSquare, Bell, CheckCircle, Clock, Search,
  Filter, Zap, MoreVertical, Activity, Bot, RefreshCw,
  Calendar, User, Loader2, PlayCircle, AlertCircle,
  Settings2, ArrowRightCircle
} from "lucide-react";
import Link from "next/link";
import { db } from "@/utils/firebase/client";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import "./../theme-inapp.css";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: "warning", label: "Scheduled" },
  completed: { color: "success", label: "Executed" },
  failed: { color: "danger", label: "Interrupted" },
};

const TYPE_ICONS: Record<string, any> = {
  "FOLLOW_UP": MessageSquare,
  "NO_SHOW_CHECK": AlertCircle,
  "CONFIRMATION_REMINDER": Bell,
};

export default function ClinicalAutomationsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "appointment_automations"),
      orderBy("scheduledFor", "asc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pb-5">
      {/* 🧭 Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
              <Cpu size={24} />
            </div>
            Autonomous Operations
          </h1>
          <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Clinical Intelligence Automations & Flow Management</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-4 shadow-sm d-flex align-items-center gap-2">
            <Settings2 size={14} /> Automation Rules
          </button>
        </div>
      </div>

      {/* 📊 High-Level Metrics */}
      <div className="row g-3 mb-4">
        {[
          { label: "Active Automations", val: tasks.filter(t => t.status === 'pending').length, color: "primary", icon: Bot, desc: "Running AI Agents" },
          { label: "Completed Today", val: tasks.filter(t => t.status === 'completed').length, color: "success", icon: CheckCircle, desc: "Processed Successfully" },
          { label: "Engagement Rate", val: "92.4%", color: "info", icon: Activity, desc: "Patient Response Metrics" },
          { label: "System Uptime", val: "99.9%", color: "dark", icon: Zap, desc: "Cloud Core Stability" },
        ].map((s, idx) => (
          <div key={idx} className="col-lg-3 col-6">
            <div className="card p-3 border-0 shadow-sm bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-0">{s.label}</p>
                <s.icon size={16} className={`text-${s.color} opacity-30`} />
              </div>
              <h3 className="fw-bold mb-0 h4 text-dark">{s.val}</h3>
              <small className="text-[9px] text-muted font-bold uppercase tracking-tighter">{s.desc}</small>
            </div>
          </div>
        ))}
      </div>

      {/* 🏛️ Automation Mission Board */}
      <div className="card shadow-sm border-0 bg-white overflow-hidden rounded-4">
        <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center px-4">
          <div className="d-flex align-items-center gap-2">
            <RefreshCw size={16} className="text-primary animate-spin-slow" />
            <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Live Task Registry</h3>
          </div>
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1"><div className="bg-warning rounded-circle" style={{ width: 8, height: 8 }}></div> Scheduled</div>
            <div className="d-flex align-items-center gap-1"><div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div> Executed</div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap">
            <thead className="bg-light border-bottom text-[10px] uppercase font-bold text-muted tracking-wider">
              <tr>
                <th className="px-4 py-3">Mission ID</th>
                <th className="py-3">Type / Category</th>
                <th className="py-3">Target Patient</th>
                <th className="py-3">Execution Time</th>
                <th className="py-3 text-center">Status</th>
                <th className="py-3 text-end pr-4">Commands</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><Loader2 className="animate-spin text-primary opacity-20" size={32} /></td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted italic text-xs">No active automation tasks in the clinical pipeline.</td></tr>
              ) : tasks.map((task) => {
                const Icon = TYPE_ICONS[task.type] || Bot;
                const status = STATUS_CONFIG[task.status] || { color: "secondary", label: task.status };
                return (
                  <tr key={task.id} className="border-bottom border-light">
                    <td className="px-4 py-3">
                      <div className="text-[10px] font-mono text-muted uppercase font-bold">#{task.id?.slice(-8).toUpperCase()}</div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light p-2 rounded-circle text-primary opacity-70"><Icon size={14} /></div>
                        <span className="text-xs font-bold text-dark uppercase tracking-tighter">{task.type?.replace(/_/g, ' ') || "General Task"}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-xs font-bold text-dark">{task.patientName || "System Target"}</div>
                      <div className="text-[9px] text-muted uppercase tracking-tighter">HN: {task.patientHn || "TSPI-9900"}</div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2 text-xs font-bold text-muted">
                        <Clock size={12} /> {task.scheduledFor ? new Date(task.scheduledFor.seconds * 1000).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`badge bg-${status.color} bg-opacity-10 text-${status.color} text-[9px] uppercase px-3 py-1 border border-${status.color} border-opacity-20 font-black`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 text-end pr-4">
                      <button className="btn btn-light btn-sm border px-3" title="View Logs">
                        <Activity size={14} className="text-muted" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10 d-flex align-items-center gap-3">
        <div className="bg-primary text-white p-2 rounded-circle shadow-sm">
          <PlayCircle size={20} />
        </div>
        <div>
          <h6 className="fw-bold text-primary mb-1 text-sm uppercase tracking-widest">Automation Intelligence Context</h6>
          <p className="text-[11px] text-muted mb-0">Autonomous operations are monitored in real-time by the V-Twin Engine. Interrupted tasks are automatically re-queued for execution after institutional safety checks are verified.</p>
        </div>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
