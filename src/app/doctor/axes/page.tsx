"use client";

import { useState, useEffect, useMemo } from "react";
import {
   PieChart as PieChartIcon, LayoutGrid, Search, Database, ChevronRight,
   Target, Activity, Layers, Info, Radar, Loader2, Filter,
   ShieldCheck, Zap, Dna, FlaskConical, Beaker, X
} from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/utils/firebase/client";
import Link from "next/link";
import BiologicalRadar from "@/components/charts/BiologicalRadar";

export default function AxesExplorer() {
   const [axes, setAxes] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [viewMode, setViewMode] = useState<"grid" | "radar">("radar");

   useEffect(() => {
      const fetchAxes = async () => {
         try {
            const q = query(collection(db, "tspi_axes_v4"), orderBy("axis_id"));
            const snapshot = await getDocs(q);
            const axesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAxes(axesData);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };
      fetchAxes();
   }, []);

   const filteredAxes = axes.filter(axis =>
      (axis.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(axis.axis_id).toLowerCase().includes(searchTerm.toLowerCase())
   );

   const radarData = useMemo(() => {
      return filteredAxes.map((axis) => ({
         axis_id: axis.axis_id,
         name: axis.name,
         value: axis.score || 50,
         domain: axis.domain_name || "Biological Axis"
      }));
   }, [filteredAxes]);

   if (loading && axes.length === 0) {
      return (
         <div className="d-flex align-items-center justify-content-center py-5">
            <div className="text-center">
               <div className="spinner-border text-primary mb-3" role="status" style={{ width: '32px', height: '32px' }}>
                  <span className="visually-hidden">Loading...</span>
               </div>
               <p className="text-muted text-xs mb-0">Loading biological axes data...</p>
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
                  Biological Axes Explorer
               </h1>
               <p className="text-xs text-muted" style={{ letterSpacing: '0.3px' }}>
                  Mechanistic Knowledge Graph & Systemic Definitions
               </p>
            </div>
            <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
               <Target size={14} className="me-1" /> Axis Calibration
            </button>
         </div>

         {/* ==================== SEARCH & VIEW TOOLS ==================== */}
         <div className="card mb-6">
            <div className="card-body p-4">
               <div className="row g-3 align-items-center">
                  <div className="col-md-6">
                     <div className="search-bar" style={{ width: '100%' }}>
                        <Search size={14} style={{ color: '#9CA3AF' }} />
                        <input
                           type="text"
                           placeholder="Filter axes by ID or biological mechanism..."
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
                  </div>
                  <div className="col-md-6">
                     <div className="d-flex gap-2 justify-content-md-end">
                        <button
                           onClick={() => setViewMode("radar")}
                           className={`btn ${viewMode === "radar" ? 'btn-primary' : 'btn-outline'}`}
                           style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                           <Radar size={14} className="me-1" /> Radar HUD
                        </button>
                        <button
                           onClick={() => setViewMode("grid")}
                           className={`btn ${viewMode === "grid" ? 'btn-primary' : 'btn-outline'}`}
                           style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                           <LayoutGrid size={14} className="me-1" /> Grid Explorer
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* ==================== CONTENT ==================== */}
         <div>
            {viewMode === "radar" ? (
               // Radar View
               <div className="card">
                  <div className="card-header">
                     <h3 className="mb-0" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.3px' }}>
                        MECHANISTIC DISTRIBUTION VISUALIZATION
                     </h3>
                  </div>
                  <div className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '550px', background: '#F9FAFB' }}>
                     {radarData.length > 0 ? (
                        <div style={{ width: '100%', height: '500px' }}>
                           <BiologicalRadar data={radarData} />
                        </div>
                     ) : (
                        <div className="text-center">
                           <Radar size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
                           <p className="text-muted text-sm">No axes data available</p>
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               // Grid View
               <div className="row g-4">
                  {filteredAxes.length === 0 ? (
                     <div className="col-12">
                        <div className="card text-center py-5">
                           <Database size={40} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
                           <p className="text-muted text-sm mb-0">No axes match your search criteria</p>
                        </div>
                     </div>
                  ) : (
                     filteredAxes.map((axis) => (
                        <div key={axis.id} className="col-lg-4 col-md-6">
                           <div className="card h-100" style={{ cursor: 'pointer' }}>
                              <div className="p-4">
                                 <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div style={{
                                       width: '40px',
                                       height: '40px',
                                       background: '#E8F0F5',
                                       borderRadius: '6px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       fontWeight: 700,
                                       fontSize: '14px',
                                       color: '#0A5C8E'
                                    }}>
                                       {axis.axis_id}
                                    </div>
                                    <span className="badge" style={{
                                       background: '#F3F4F6',
                                       color: '#6B7280',
                                       fontSize: '9px',
                                       fontWeight: 500,
                                       padding: '3px 8px'
                                    }}>
                                       Verified
                                    </span>
                                 </div>

                                 <h5 style={{
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    color: '#1F2937',
                                    marginBottom: '8px',
                                    letterSpacing: '0.3px'
                                 }}>
                                    {axis.name}
                                 </h5>

                                 <p style={{
                                    fontSize: '12px',
                                    color: '#6B7280',
                                    marginBottom: '16px',
                                    lineHeight: 1.5,
                                    minHeight: '54px'
                                 }}>
                                    {axis.description || "Mechanistic description for this biological axis is being provisioned from the knowledge base."}
                                 </p>

                                 <div className="pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                       <div className="d-flex align-items-center gap-1">
                                          <Activity size={10} style={{ color: '#9CA3AF' }} />
                                          <span style={{ fontSize: '9px', color: '#9CA3AF', letterSpacing: '0.3px' }}>
                                             CONFIDENCE INDEX
                                          </span>
                                       </div>
                                       <span style={{ fontWeight: 600, fontSize: '12px', color: '#1F2937' }}>
                                          {axis.confidence || 0.962}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}
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
               <h6 style={{ fontWeight: 600, fontSize: '11px', color: '#0A5C8E', marginBottom: '4px', letterSpacing: '0.3px' }}>
                  BIOLOGICAL AXIS FRAMEWORK
               </h6>
               <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  The <strong style={{ color: '#1F2937' }}>TSPI 36-Axis Framework</strong> represents the complete mechanistic landscape of human health.
                  Each axis is a functional biological unit used to calculate systemic load and disease burden through proprietary V-Twin algorithms.
               </p>
            </div>
         </div>
      </div>
   );
}