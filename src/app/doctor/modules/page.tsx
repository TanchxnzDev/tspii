"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, Download,
  Filter, Loader2, FileText, AlertCircle,
  CheckCircle, Database, LayoutGrid, Import,
  Library, Settings2, FileOutput
} from "lucide-react";
import Link from "next/link";
import { db } from "@/utils/firebase/client";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import "./../theme-inapp.css";

export default function ModuleMasterPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "tspi_modules_v4"));
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").slice(1);

      let count = 0;
      for (const row of rows) {
        if (!row.trim()) continue;
        const [name, category, properties, indications] = row.split(",");

        await addDoc(collection(db, "tspi_modules_v4"), {
          name: name?.trim(),
          category: category?.trim(),
          properties: properties?.trim(),
          indications: indications?.trim(),
          createdAt: serverTimestamp(),
        });
        count++;
      }
      alert(`Successfully imported ${count} therapeutic modules.`);
      fetchModules();
      setIsImporting(false);
      setShowImport(false);
    };
    reader.readAsText(file);
  };

  const filteredModules = modules.filter(m =>
    (m.name || m.module_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-5">
      {/* 🧭 Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
              <Library size={24} />
            </div>
            Therapeutic Knowledge Base
          </h1>
          <p className="text-muted text-xs uppercase font-bold tracking-widest ms-5">Protocol Registry & Master Data Management</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn btn-outline-secondary btn-sm font-bold uppercase tracking-tighter px-3 bg-white shadow-sm d-flex align-items-center gap-1"
          >
            <Import size={14} /> Import CSV
          </button>
          <button className="btn btn-primary btn-sm font-bold uppercase tracking-tighter px-3 shadow-sm d-flex align-items-center gap-1">
            <Plus size={14} /> New Protocol
          </button>
        </div>
      </div>

      {/* 🛠️ Action Tools & Filters */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control bg-light border-0 font-bold text-sm"
                  placeholder="Search protocols by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="btn-group shadow-sm">
                {["All Protocols", "Standard", "Experimental", "Legacy"].map((cat) => (
                  <button
                    key={cat}
                    className={`btn btn-sm px-3 font-bold uppercase tracking-tighter ${cat === 'All Protocols' ? 'btn-primary' : 'btn-light border bg-white text-muted'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧪 Import HUD */}
      {showImport && (
        <div className="card border-0 shadow-sm bg-primary bg-opacity-5 border-dashed border-2 border-primary border-opacity-20 mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="card-body p-4 text-center">
            <div className="bg-white d-inline-flex p-3 rounded-circle shadow-sm mb-3 text-primary">
              <FileOutput size={32} />
            </div>
            <h5 className="fw-bold text-primary mb-2 text-sm uppercase tracking-widest">Protocol Batch Importer</h5>
            <p className="text-muted text-[11px] mx-auto mb-4" style={{ maxWidth: '400px' }}>Select a CSV file containing your clinical protocol data. The system will automatically parse and register each module into the Knowledge Base.</p>
            <div className="d-flex justify-content-center gap-2">
              <input
                type="file"
                id="csvInput"
                className="d-none"
                accept=".csv"
                onChange={handleCSVImport}
              />
              <label htmlFor="csvInput" className="btn btn-primary px-4 font-bold uppercase tracking-widest text-[10px]">
                {isImporting ? <Loader2 className="animate-spin" size={14} /> : 'Choose CSV File'}
              </label>
              <button onClick={() => setShowImport(false)} className="btn btn-light border bg-white px-4 font-bold uppercase tracking-widest text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ Data Registry Table */}
      <div className="card shadow-sm border-0 bg-white overflow-hidden">
        <div className="card-header bg-transparent border-bottom border-light py-3 d-flex justify-content-between align-items-center">
          <h3 className="card-title text-[10px] font-bold uppercase text-muted tracking-widest mb-0">Master Data Registry</h3>
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Showing {filteredModules.length} Records</div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-valign-middle mb-0 text-nowrap">
            <thead className="bg-light border-bottom text-[10px] uppercase font-bold text-muted tracking-wider">
              <tr>
                <th className="px-4 py-3">Module Identity</th>
                <th className="py-3">Category</th>
                <th className="py-3">Clinical Indications</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end pr-4">Commands</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Loader2 className="animate-spin text-primary opacity-20" size={32} /></td></tr>
              ) : filteredModules.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted italic text-xs">No therapeutic protocols found in the registry.</td></tr>
              ) : filteredModules.map((m) => (
                <tr key={m.id} className="border-bottom border-light">
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 text-primary rounded me-3 d-flex items-center justify-center font-bold" style={{ width: '38px', height: '38px' }}>
                        <Settings2 size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-dark text-sm mb-0">{m.name || m.module_name}</div>
                        <small className="text-muted font-bold text-[10px] uppercase tracking-tighter">ID: {m.id?.slice(0, 8).toUpperCase()}</small>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="badge bg-light border text-muted text-[9px] px-2 py-1 uppercase font-black">{m.category || "General"}</span>
                  </td>
                  <td className="py-3">
                    <div className="text-xs text-dark font-medium text-truncate" style={{ maxWidth: '300px' }} title={m.indications}>{m.indications || "No specific indications defined."}</div>
                  </td>
                  <td className="py-3">
                    <div className="d-flex align-items-center gap-1 text-success font-bold text-[10px] uppercase tracking-tighter">
                      <CheckCircle size={10} /> Active
                    </div>
                  </td>
                  <td className="py-3 text-end pr-4">
                    <div className="btn-group shadow-sm">
                      <button className="btn btn-light btn-sm border px-3" title="Edit Protocol"><Edit2 size={14} className="text-primary" /></button>
                      <button className="btn btn-light btn-sm border border-start-0 px-3 text-danger" title="Delete Protocol"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
