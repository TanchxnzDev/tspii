"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
   Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
   ResponsiveContainer, Tooltip as RechartsTooltip
} from "recharts";
import { medicalDb } from "@/lib/medical-data";
import axesBlueprint from "@/data/tspi_36_axes_v2.json";
import {
   Search, ShieldCheck, Zap, Activity, Brain,
   RefreshCw, Star, Users, ShieldAlert,
   Settings2, ClipboardCheck, Dna, Droplet,
   Heart, Bone, Printer, Download
} from "lucide-react";

// ── Domain config ────────────────────────────────────────────────
const DOMAINS_MAP: Record<string, { name: string; color: string; icon: any; description: string }> = {
   DOMAIN_1: { name: "Immune System", color: "#ef4444", icon: ShieldCheck, description: "Immune response & inflammation" },
   DOMAIN_2: { name: "Metabolic Flux", color: "#10b981", icon: Zap, description: "Energy & metabolic regulation" },
   DOMAIN_3: { name: "Genomic Stability", color: "#3b82f6", icon: Dna, description: "DNA repair & cellular aging" },
   DOMAIN_4: { name: "Detoxification", color: "#f59e0b", icon: Droplet, description: "Toxin elimination pathways" },
   DOMAIN_5: { name: "Vascular Health", color: "#ec4899", icon: Heart, description: "Cardiovascular integrity" },
   DOMAIN_6: { name: "Structural Repair", color: "#8b5cf6", icon: Bone, description: "Tissue regeneration & repair" },
   DOMAIN_7: { name: "Musculoskeletal", color: "#f43f5e", icon: Activity, description: "Bone & muscle integrity" },
   DOMAIN_8: { name: "Endocrine Network", color: "#fb923c", icon: Star, description: "Hormonal & adrenal balance" },
   DOMAIN_9: { name: "Neuro-Sleep", color: "#6366f1", icon: Brain, description: "Brain health & circadian rhythm" },
   DOMAIN_10: { name: "Organ Resilience", color: "#06b6d4", icon: ShieldAlert, description: "Organ reserve & resilience" },
   DOMAIN_11: { name: "Oncology Control", color: "#1e293b", icon: Star, description: "Tumor microenvironment" },
   DOMAIN_12: { name: "Proteostasis", color: "#7c3aed", icon: Settings2, description: "Protein quality & clearance" },
};

// ── Shared style helpers ─────────────────────────────────────────
const card: React.CSSProperties = {
   background: "#FFFFFF",
   border: "1px solid #E5E7EB",
   borderRadius: "8px",
   padding: "20px",
};

const cardDark: React.CSSProperties = {
   background: "#111827",
   border: "1px solid rgba(255,255,255,0.08)",
   borderRadius: "8px",
   overflow: "hidden",
};

const sectionLabel: React.CSSProperties = {
   fontSize: "11px",
   fontWeight: 600,
   color: "#6B7280",
   letterSpacing: "0.5px",
   textTransform: "uppercase",
};

const ghostBtn: React.CSSProperties = {
   background: "transparent",
   border: "1px solid #E5E7EB",
   borderRadius: "4px",
   padding: "6px 10px",
   cursor: "pointer",
   fontSize: "11px",
   color: "#6B7280",
   display: "flex",
   alignItems: "center",
   gap: "6px",
};

// ── Main component ───────────────────────────────────────────────
function DigitalTwinStandard() {
   const searchParams = useSearchParams();
   const patientId = searchParams.get("id");
   const router = useRouter();

   const [loading, setLoading] = useState(true);
   const [data, setData] = useState<any[]>([]);
   const [patient, setPatient] = useState<any>(null);
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [aiReport, setAiReport] = useState<any>(null);
   const [patients, setPatients] = useState<any[]>([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [showSearch, setShowSearch] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const pList = await medicalDb.getPatientList();
            setPatients(pList);

            if (!patientId) { setLoading(false); return; }

            const patientData = await medicalDb.getPatient(patientId);
            if (patientData) {
               const fullName = patientData.fname
                  ? `${patientData.fname} ${patientData.lname || ""}`
                  : patientData.name || "Unknown Patient";
               setPatient({ ...patientData, name: fullName });

               const domainData = (axesBlueprint as any).domains.map((domain: any) => {
                  const axesIds = domain.axes.map((a: any) => a.axis_id);
                  const scores = axesIds.map((id: any) =>
                     patientData.axes?.[id]?.score ?? 0
                  );
                  const avgScore = scores.length > 0
                     ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
                     : 0;
                  const mapping = DOMAINS_MAP[domain.domain_id] ?? { name: domain.name_en, color: "#6B7280", icon: Activity, description: "" };
                  return { ...mapping, domain: mapping.name, score: avgScore };
               });
               setData(domainData);
            }
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [patientId]);

   const handleSelectPatient = (id: string) => {
      setShowSearch(false);
      router.push(`/doctor/digital-twin?id=${id}`);
   };

   const runAIAnalysis = async () => {
      if (!patient || !patientId) return;
      setIsAnalyzing(true);
      try {
         console.log("🚀 Initializing Neural Clinical Intelligence Sync...");
         const response = await fetch('/api/ai/brain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               patientId,
               clinicalContext: {
                  patientName: patient.name,
                  hn: patient.hn,
                  axes: patient.axes || {}
               },
               systemInstruction: `คุณคือ TSPI Neural Intelligence ผู้เชี่ยวชาญด้าน Mechanistic Medicine 
               โปรดวิเคราะห์คนไข้รายนี้ตามหลักการ TSPI 39-Axis 
               1. ตอบเป็นภาษาไทยระดับวิชาชีพแพทย์ (Professional Clinical Thai)
               2. จัดหัวข้อให้ชัดเจน: [Clinical Impression], [Mechanistic Analysis], [Systemic Burden Evaluation]
               3. สรุปกระบวนการทางชีวภาพที่ผิดปกติ (Pathophysiology) ให้สั้นกระชับแต่ได้ใจความ
               4. ปิดท้ายด้วย JSON block ในรูปแบบนี้เท่านั้น: :::BIO_UPDATE::: { "axes": [ { "axis_id": "ID", "severity": number, "insight": "..." } ] } :::`,
               engine: "groq"
            })
         });
         
         const result = await response.json();
         if (result.error) throw new Error(result.message || result.error);

         let mainContent = result.content;
         const bioMatch = mainContent.match(/:::BIO_UPDATE:::(.*?):::/s);
         
         if (bioMatch) {
            try {
               const bioUpdateString = bioMatch[1].trim();
               const bioUpdate = JSON.parse(bioUpdateString);
               if (bioUpdate.axes) {
                  console.log("🧬 Synchronizing Bio-Vectors...");
                  const currentAxes = patient.axes || {};
                  const updatedAxes = { ...currentAxes };
                  
                  bioUpdate.axes.forEach((upd: any) => {
                     updatedAxes[upd.axis_id] = {
                        ...currentAxes[upd.axis_id],
                        score: upd.severity,
                        insight: upd.insight,
                        lastUpdate: new Date().toISOString()
                     };
                  });

                  const { doc, updateDoc } = await import("firebase/firestore");
                  const { db } = await import("@/utils/firebase/client");
                  await updateDoc(doc(db, "patients", patientId), { axes: updatedAxes });

                  setPatient({ ...patient, axes: updatedAxes });
                  
                  const domainData = (axesBlueprint as any).domains.map((domain: any) => {
                     const axesIds = domain.axes.map((a: any) => a.axis_id);
                     const scores = axesIds.map((id: any) => updatedAxes[id]?.score ?? 0);
                     const avgScore = scores.length > 0
                        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
                        : 0;
                     const mapping = DOMAINS_MAP[domain.domain_id] ?? { name: domain.name_en, color: "#6B7280", icon: Activity, description: "" };
                     return { ...mapping, domain: mapping.name, score: avgScore };
                  });
                  setData(domainData);
               }
               mainContent = mainContent.replace(/:::BIO_UPDATE:::.*?:::/s, "").trim();
            } catch (e) {
               console.warn("Bio-Sync Failed:", e);
            }
         }
         
         setAiReport({
            chapters: {
               "1": {
                  clinicalImpression: {
                     summary: mainContent,
                     keyFindings: bioMatch ? JSON.parse(bioMatch[1].trim()).axes.map((a: any) => `${a.axis_id}: ${a.severity}% burden - ${a.insight}`) : [],
                     severity: "DYNAMIC",
                  },
                  recommendedActions: [],
               },
            },
         });
      } catch (error: any) {
         console.error("Analysis Error:", error);
         const msg = error.message || "Unknown Error";
         alert(`Analysis Failed: ${msg}\n\nCheck terminal for more details.`);
      } finally {
         setIsAnalyzing(false);
      }
   };

   const filteredPatients = patients.filter(p =>
      (p.fname || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.hn || "").toLowerCase().includes(searchTerm.toLowerCase())
   );

   if (loading) {
      return (
         <div style={{ textAlign: "center", padding: "80px 20px", color: "#9CA3AF", fontSize: "13px" }}>
            Calibrating Digital Twin…
         </div>
      );
   }

   return (
      <div style={{ paddingBottom: "40px" }}>

         {/* ── Header ─────────────────────────────────────────────── */}
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
               <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <div style={{ background: "#E8F0F5", padding: "8px", borderRadius: "6px", display: "flex" }}>
                     <Zap size={20} style={{ color: "#0A5C8E" }} />
                  </div>
                  <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1F2937", margin: 0 }}>Digital Twin HUD</h1>
               </div>
               <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 0 52px", letterSpacing: "0.3px" }}>
                  Biological Replica & Mechanistic Load Analysis
               </p>
            </div>

            {/* Patient selector */}
            <div style={{ position: "relative" }}>
               <button
                  onClick={() => setShowSearch(v => !v)}
                  className="btn btn-primary"
                  style={{ fontSize: "12px", padding: "7px 14px", display: "flex", alignItems: "center", gap: "8px" }}
               >
                  <Users size={14} />
                  {patient?.name || "Select Patient"}
               </button>

               {showSearch && (
                  <div style={{
                     position: "absolute", right: 0, top: "calc(100% + 8px)",
                     width: "300px", ...card, zIndex: 200,
                     boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "16px",
                  }}>
                     {/* Search input */}
                     <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        border: "1px solid #E5E7EB", borderRadius: "4px",
                        padding: "7px 12px", background: "#F9FAFB", marginBottom: "12px",
                     }}>
                        <Search size={13} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                        <input
                           autoFocus
                           type="text"
                           placeholder="Search patients…"
                           value={searchTerm}
                           onChange={e => setSearchTerm(e.target.value)}
                           style={{ background: "transparent", border: "none", outline: "none", fontSize: "13px", flex: 1, color: "#1F2937" }}
                        />
                     </div>

                     <div style={{ maxHeight: "260px", overflowY: "auto" }} className="custom-scrollbar">
                        {filteredPatients.map(p => (
                           <button
                              key={p.id}
                              onClick={() => handleSelectPatient(p.id)}
                              style={{
                                 width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                 padding: "8px 10px", background: "transparent", border: "none",
                                 borderRadius: "4px", cursor: "pointer", marginBottom: "2px", textAlign: "left",
                                 transition: "background 0.1s",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                           >
                              <div style={{
                                 width: "30px", height: "30px", borderRadius: "50%",
                                 background: "#1F2937", color: "white",
                                 display: "flex", alignItems: "center", justifyContent: "center",
                                 fontSize: "12px", fontWeight: 600, flexShrink: 0,
                              }}>
                                 {(p.fname || p.name || "?").charAt(0)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                 <div style={{ fontSize: "13px", fontWeight: 500, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {p.fname || p.name}
                                 </div>
                                 <div style={{ fontSize: "11px", color: "#9CA3AF" }}>HN: {p.hn || p.id.slice(0, 8)}</div>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ── No patient selected ─────────────────────────────────── */}
         {!patientId ? (
            <div style={{ ...card, textAlign: "center", padding: "60px 40px", margin: "40px auto", maxWidth: "480px" }}>
               <div style={{ marginBottom: "20px" }}>
                  <div style={{ background: "#F3F4F6", display: "inline-flex", padding: "20px", borderRadius: "50%", marginBottom: "16px" }}>
                     <Dna size={40} style={{ color: "#D1D5DB" }} />
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1F2937", marginBottom: "8px" }}>No Active HUD</h2>
                  <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 auto", maxWidth: "340px" }}>
                     Select a patient from the session registry to initialize the Digital Twin.
                  </p>
               </div>
               <button onClick={() => setShowSearch(true)} className="btn btn-primary" style={{ padding: "8px 24px" }}>
                  Open Session Hub
               </button>
            </div>
         ) : (
            /* ── Two-column layout ─────────────────────────────────── */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

               {/* ══ LEFT: Radar + Domain cards ══════════════════════ */}
               <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Radar chart */}
                  <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                     <div style={{
                        padding: "14px 20px", borderBottom: "1px solid #E5E7EB",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                           <Activity size={15} style={{ color: "#0A5C8E" }} />
                           <span style={sectionLabel}>Systemic Biological Burden</span>
                        </div>
                        <span style={{
                           background: "#E8F0F5", color: "#0A5C8E",
                           fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                           borderRadius: "4px", letterSpacing: "0.3px",
                        }}>
                           Live Mapping
                        </span>
                     </div>
                     <div style={{ height: "380px", background: "#FAFAFA", display: "flex", alignItems: "center" }}>
                        <ResponsiveContainer width="100%" height="90%">
                           <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
                              <PolarGrid stroke="#E5E7EB" />
                              <PolarAngleAxis dataKey="domain" tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                 name="Biological Load"
                                 dataKey="score"
                                 stroke="#0A5C8E"
                                 strokeWidth={2.5}
                                 fill="#0A5C8E"
                                 fillOpacity={0.12}
                              />
                              <RechartsTooltip />
                           </RadarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Domain cards grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                     {data.map((d, i) => {
                        const Icon = d.icon;
                        return (
                           <div key={i} style={{
                              ...card, padding: "14px",
                              borderTop: `3px solid ${d.color}`,
                              cursor: "pointer", transition: "border-color 0.15s",
                           }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                 <div style={{ background: "#F3F4F6", padding: "7px", borderRadius: "6px", display: "flex" }}>
                                    <Icon size={15} style={{ color: "#6B7280" }} />
                                 </div>
                                 <span style={{ fontSize: "20px", fontWeight: 600, color: d.color }}>{d.score}%</span>
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1F2937", marginBottom: "3px" }}>
                                 {d.domain}
                              </div>
                              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{d.description}</p>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* ══ RIGHT: AI Analysis + Config ═════════════════════ */}
               <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* AI Panel — dark */}
                  <div style={cardDark}>
                     {/* Panel header */}
                     <div style={{
                        padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "#0D1117",
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                           <div style={{ background: "#0A5C8E", padding: "7px", borderRadius: "6px", display: "flex" }}>
                              <Brain size={16} style={{ color: "white" }} />
                           </div>
                           <span style={{ ...sectionLabel, color: "#D1D5DB" }}>Neural Clinical Intelligence</span>
                        </div>
                        <button
                           onClick={runAIAnalysis}
                           disabled={isAnalyzing}
                           className="btn btn-primary"
                           style={{ fontSize: "11px", padding: "5px 12px", opacity: isAnalyzing ? 0.7 : 1 }}
                        >
                           {isAnalyzing
                              ? <><RefreshCw size={12} style={{ animation: "spin 0.8s linear infinite" }} /> Analyzing…</>
                              : "Initialize Analysis"}
                        </button>
                     </div>

                     {/* Panel body */}
                     <div style={{ padding: "20px", minHeight: "360px", background: "#0A0F1A" }}>
                        {!aiReport && !isAnalyzing && (
                           <div style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 0.3 }}>
                              <Star size={40} style={{ color: "white", marginBottom: "16px" }} />
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "white", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                                 Ready for Neural Sync
                              </div>
                              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "8px" }}>
                                 Activate the AI engine to generate mechanistic findings.
                              </p>
                           </div>
                        )}

                        {isAnalyzing && (
                           <div style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                              <div style={{
                                 width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)",
                                 borderTopColor: "#0A5C8E", borderRadius: "50%",
                                 animation: "spin 0.8s linear infinite", marginBottom: "20px",
                              }} />
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0A5C8E", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                                 Analyzing Biological Vectors
                              </div>
                              <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "8px" }}>
                                 Accessing TSPI Precision Knowledge Base…
                              </p>
                           </div>
                        )}

                        {aiReport && !isAnalyzing && (
                           <div>
                              {/* Impression card */}
                              <div style={{
                                 background: "rgba(10,92,142,0.15)", border: "1px solid rgba(10,92,142,0.3)",
                                 borderRadius: "6px", padding: "14px", marginBottom: "20px",
                              }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <ShieldAlert size={15} style={{ color: "#60A5FA" }} />
                                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#60A5FA", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                                       Clinical Impression: {aiReport.chapters["1"].clinicalImpression.severity}
                                    </span>
                                 </div>
                                 <p style={{ fontSize: "13px", color: "#D1D5DB", margin: 0, lineHeight: 1.6 }}>
                                    {aiReport.chapters["1"].clinicalImpression.summary}
                                 </p>
                              </div>

                              {/* Key findings */}
                              <div style={{ ...sectionLabel, color: "#6B7280", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                 Key Mechanistic Findings
                              </div>
                              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
                                 {aiReport.chapters["1"].clinicalImpression.keyFindings.map((f: string, idx: number) => (
                                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                                       <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0A5C8E", marginTop: "5px", flexShrink: 0 }} />
                                       <span style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5 }}>{f}</span>
                                    </li>
                                 ))}
                              </ul>

                              {/* Recommended actions */}
                              <div style={{ ...sectionLabel, color: "#6B7280", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                 Protocol Recommendations
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                 {aiReport.chapters["1"].recommendedActions.map((act: any, idx: number) => (
                                    <div key={idx} style={{
                                       background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                       borderRadius: "6px", padding: "12px 14px",
                                       display: "flex", justifyContent: "space-between", alignItems: "center",
                                    }}>
                                       <div>
                                          <div style={{ fontSize: "13px", fontWeight: 500, color: "white", marginBottom: "3px" }}>{act.action}</div>
                                          <div style={{ fontSize: "11px", color: "#6B7280" }}>{act.rationale}</div>
                                       </div>
                                       <span style={{
                                          background: act.priority === "URGENT" ? "#FEF2F2" : "#E8F0F5",
                                          color: act.priority === "URGENT" ? "#DC2626" : "#0A5C8E",
                                          fontSize: "10px", fontWeight: 600,
                                          padding: "3px 8px", borderRadius: "4px",
                                          whiteSpace: "nowrap", marginLeft: "12px",
                                       }}>
                                          {act.priority}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Panel footer */}
                     <div style={{
                        padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)",
                        background: "#0D1117", display: "flex", justifyContent: "center", gap: "24px",
                     }}>
                        <button style={{ ...ghostBtn, color: "#6B7280", border: "none", background: "transparent" }}>
                           <Printer size={12} /> Print Analysis
                        </button>
                        <button style={{ ...ghostBtn, color: "#6B7280", border: "none", background: "transparent" }}>
                           <Download size={12} /> Save to Cloud
                        </button>
                     </div>
                  </div>

                  {/* HUD Config card */}
                  <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                     <div style={{
                        padding: "14px 20px", borderBottom: "1px solid #E5E7EB",
                        display: "flex", alignItems: "center", gap: "8px",
                     }}>
                        <Settings2 size={15} style={{ color: "#0A5C8E" }} />
                        <span style={sectionLabel}>HUD Configuration</span>
                     </div>
                     <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        {[
                           { icon: ClipboardCheck, label: "V-Twin Stability", value: "0.985 SIGMA", color: "#0A5C8E" },
                           { icon: ShieldCheck, label: "PDPA Compliance", value: "Level 3", color: "#059669" },
                        ].map(({ icon: Icon, label, value, color }) => (
                           <div key={label} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "8px", display: "flex" }}>
                                 <Icon size={16} style={{ color }} />
                              </div>
                              <div>
                                 <div style={{ fontSize: "10px", color: "#9CA3AF", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
                                 <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>{value}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .twin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </div>
   );
}

// ── Page wrapper with Suspense ───────────────────────────────────
export default function DigitalTwinPage() {
   return (
      <Suspense fallback={
         <div style={{ textAlign: "center", padding: "80px 20px", color: "#9CA3AF", fontSize: "13px" }}>
            Initializing Biological Replica…
         </div>
      }>
         <DigitalTwinStandard />
      </Suspense>
   );
}