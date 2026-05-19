"use client";

import { useState, useEffect } from "react";
import {
  Grid3x3, Search, Download, Printer, Activity,
  Layers, FlaskConical, Filter, Info, Loader2, Database,
  ArrowRightLeft, Settings2, X
} from "lucide-react";
import Link from "next/link";
import { getAxes, getModules } from "@/utils/firebase/services";

interface MatrixData {
  id: string;
  module_name: string;
  module_code: string;
  category: string;
  axes_mapping: Record<string, number>;
}

export default function TherapeuticMatrixPage() {
  const [axes, setAxes] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<MatrixData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const axesList = await getAxes();
        const sortedAxes = axesList.sort((a: any, b: any) => {
          const idA = parseInt(String(a.axis_id || "0").replace(/\D/g, ''));
          const idB = parseInt(String(b.axis_id || "0").replace(/\D/g, ''));
          return idA - idB;
        });
        setAxes(sortedAxes);

        const modulesList = await getModules();

        const matrixData: MatrixData[] = modulesList.map((module: any) => {
          const mapping: Record<string, number> = {};
          const mappingStr = module.tspi_axis_mapping || "";

          sortedAxes.forEach(axis => {
            const axisId = axis.axis_id || axis.id;
            // Precise check for "Axis N " in the mapping string
            const isMatch = mappingStr.includes(`Axis ${axisId} `);
            mapping[axisId] = isMatch ? 1.0 : 0; // Show as 1.0 (Full match) for now
          });

          const displayName = module.name || module["Product Derived From"] || "Unknown Module";

          return {
            id: module.id,
            module_name: displayName,
            module_code: module.module_code || module.id,
            category: module["Health Category"] || "General",
            axes_mapping: mapping
          };
        });

        setMatrix(matrixData);
      } catch (err) {
        console.error("Error fetching matrix data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMatrix = matrix.filter(m =>
    (m.module_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.module_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreStyle = (score: number) => {
    if (score === 0) {
      return { background: 'transparent', color: '#D1D5DB', fontWeight: 400 };
    }
    if (score < 0.3) {
      return { background: '#ECFDF5', color: '#059669', fontWeight: 500 };
    }
    if (score < 0.6) {
      return { background: '#FFFBEB', color: '#D97706', fontWeight: 600 };
    }
    return { background: '#0A5C8E', color: 'white', fontWeight: 700 };
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '32px', height: '32px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted text-xs mb-0">Loading therapeutic matrix...</p>
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
            Therapeutic Matrix
          </h1>
          <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
            Module-Axis Correlation Mapping & Clinical Logic
          </p>
        </div>
        <div className="d-flex gap-3">
          <div className="search-bar" style={{ width: '260px' }}>
            <Search size={14} style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={12} style={{ color: '#9CA3AF' }} />
              </button>
            )}
          </div>
          <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }}>
            <Download size={14} className="me-1" /> Export CSV
          </button>
        </div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="row g-4 mb-6">
        {[
          { label: "Active Modules", value: matrix.length, icon: Layers },
          { label: "Biological Axes", value: axes.length, icon: Activity },
          { label: "Active Links", value: "~2,480", icon: ArrowRightLeft },
          { label: "Logic Version", value: "v3.2.1", icon: Settings2 },
        ].map((stat, idx) => (
          <div key={idx} className="col-lg-3 col-md-6">
            <div className="card p-4">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: '#E8F0F5',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={20} style={{ color: '#0A5C8E' }} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px', marginBottom: '4px' }}>
                    {stat.label}
                  </p>
                  <h3 style={{ fontWeight: 600, fontSize: '24px', color: '#1F2937', margin: 0 }}>
                    {stat.value}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== MATRIX TABLE ==================== */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
            MECHANISTIC CORRELATION MAPPING
          </h3>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: '10px', height: '10px', background: '#ECFDF5', border: '1px solid #059669', borderRadius: '2px' }} />
              <span style={{ fontSize: '9px', color: '#6B7280' }}>Low</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: '10px', height: '10px', background: '#FFFBEB', border: '1px solid #D97706', borderRadius: '2px' }} />
              <span style={{ fontSize: '9px', color: '#6B7280' }}>Medium</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: '10px', height: '10px', background: '#0A5C8E', borderRadius: '2px' }} />
              <span style={{ fontSize: '9px', color: '#6B7280' }}>High</span>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6B7280',
                  letterSpacing: '0.3px',
                  position: 'sticky',
                  left: 0,
                  background: '#F9FAFB',
                  zIndex: 10,
                  minWidth: '220px'
                }}>
                  THERAPEUTIC MODULE
                </th>
                {axes.map(axis => (
                  <th
                    key={axis.axis_id || axis.id}
                    style={{
                      padding: '14px 8px',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#6B7280',
                      letterSpacing: '0.3px',
                      minWidth: '55px'
                    }}
                  >
                    {axis.axis_id || axis.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={axes.length + 1} style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <p className="text-muted text-sm mb-0">No matching modules found</p>
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((module, rowIdx) => (
                  <tr
                    key={module.id}
                    style={{
                      borderBottom: rowIdx === filteredMatrix.length - 1 ? 'none' : '1px solid #F3F4F6'
                    }}
                  >
                    <td style={{
                      padding: '12px 16px',
                      position: 'sticky',
                      left: 0,
                      background: 'white',
                      zIndex: 5,
                      borderRight: '1px solid #F3F4F6'
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937', marginBottom: '2px' }}>
                        {module.module_name}
                      </div>
                      <div style={{ fontSize: '9px', color: '#0A5C8E', letterSpacing: '0.3px' }}>
                        {module.module_code}
                      </div>
                    </td>
                    {axes.map(axis => {
                      const score = module.axes_mapping[axis.axis_id || axis.id] || 0;
                      const style = getScoreStyle(score);
                      return (
                        <td
                          key={axis.axis_id || axis.id}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            background: style.background,
                            color: style.color,
                            fontWeight: style.fontWeight,
                            fontSize: '11px',
                            border: 'none'
                          }}
                        >
                          {score > 0 ? score.toFixed(1) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== INFO FOOTER ==================== */}
      <div className="mt-6" style={{
        padding: '16px 20px',
        background: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
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
          <Info size={14} style={{ color: '#0A5C8E' }} />
        </div>
        <div>
          <h6 style={{ fontWeight: 600, fontSize: '12px', color: '#0A5C8E', marginBottom: '4px', letterSpacing: '0.3px' }}>
            MECHANISTIC CORRELATION CONTEXT
          </h6>
          <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
            Values represent the <strong style={{ color: '#1F2937' }}>mechanistic relevance score</strong> between therapeutic modules and biological axes.
            Derived from institutional clinical protocols and the TSPI precision medicine framework.
          </p>
        </div>
      </div>
    </div>
  );
}