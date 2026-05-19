"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/client";
import { FlaskConical, History, Pill, ClipboardList, ChevronRight } from "lucide-react";

interface ContextInspectorProps {
  patientId: string;
}

export default function ContextInspector({ patientId }: ContextInspectorProps) {
  const [labs, setLabs] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchClinicalContext = async () => {
      try {
        const patientRef = doc(db, "patients", patientId);
        const snap = await getDoc(patientRef);

        if (!snap.exists()) {
          setError("ไม่พบข้อมูลคนไข้");
          setLoading(false);
          return;
        }

        const data = snap.data();

        // Labs: from patient document or subcollection
        const rawLabs = data.labs || data.lab_results || [];
        const formattedLabs = Array.isArray(rawLabs)
          ? rawLabs.map((l: any) => ({
              test_name: l.test_name || l.name || l.parameter || "Unknown Test",
              result_value: l.result_value ?? l.value ?? l.result ?? "-",
              unit: l.unit || "",
              is_abnormal: l.is_abnormal ?? l.abnormal ?? false,
              test_date: l.test_date || l.date || l.collected_at || "",
            }))
          : [];

        // Medications: from patient document
        const rawMeds = data.medications || data.meds || data.medication_list || [];
        const formattedMeds = Array.isArray(rawMeds)
          ? rawMeds.map((m: any) => ({
              name: m.name || m.medication_name || m.drug || "Unknown Drug",
              dosage: m.dosage || m.dose || "",
              purpose: m.purpose || m.indication || m.reason || "",
            }))
          : [];

        setLabs(formattedLabs);
        setMedications(formattedMeds);
      } catch (err: any) {
        console.error("ContextInspector: Failed to load clinical data:", err);
        setError("โหลดข้อมูลคลินิกล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    fetchClinicalContext();
  }, [patientId]);
  
  return (
    <div className="bg-white rounded-5 shadow-sm border border-light p-4 h-100 overflow-hidden d-flex flex-column">
      <div className="d-flex align-items-center gap-2 mb-4">
        <History size={20} className="text-primary-custom" />
        <h6 className="fw-bold mb-0 text-uppercase tracking-wider tiny">Clinical Context</h6>
        {loading && <div className="spinner-border spinner-border-sm ms-auto text-primary-custom" role="status" />}
      </div>

      <div className="flex-grow-1 overflow-auto pe-2 custom-scrollbar">
        {error ? (
          <div className="text-center py-4 bg-light bg-opacity-50 rounded-4 border border-dashed">
            <p className="tiny text-muted mb-0">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-4">
            <p className="tiny text-muted mb-0">กำลังโหลดข้อมูลคลินิก...</p>
          </div>
        ) : (
          <>
            {/* Lab Results Section */}
            <div className="mb-4">
              <p className="tiny fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2">
                <FlaskConical size={14} /> Latest Lab Results
              </p>
              <div className="d-grid gap-2">
                {labs.length > 0 ? labs.map((lab: any, i: number) => (
                  <div key={i} className="p-3 bg-light rounded-4 border border-light-subtle">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="small fw-bold text-dark">{lab.test_name || "Unknown Test"}</span>
                      <span className={`tiny fw-bold ${lab.is_abnormal ? 'text-danger' : 'text-success'}`}>
                        {lab.result_value} {lab.unit}
                      </span>
                    </div>
                    <p className="tiny text-muted mb-0">{lab.test_date || "N/A"}</p>
                  </div>
                )) : (
                  <div className="text-center py-4 bg-light bg-opacity-50 rounded-4 border border-dashed">
                    <p className="tiny text-muted mb-0">ไม่พบข้อมูลผล Lab ล่าสุด</p>
                  </div>
                )}
              </div>
            </div>

            {/* Medication Section */}
            <div className="mb-4">
              <p className="tiny fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2">
                <Pill size={14} /> Active Medications
              </p>
              <div className="d-grid gap-2">
                {medications.length > 0 ? medications.map((med: any, i: number) => (
                  <div key={i} className="p-3 bg-light rounded-4 border border-light-subtle">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="small fw-bold text-dark">{med.name || "Unknown Drug"}</span>
                      <span className="tiny fw-bold text-muted">{med.dosage || ""}</span>
                    </div>
                    {med.purpose && <p className="tiny text-muted mb-0">{med.purpose}</p>}
                  </div>
                )) : (
                  <div className="text-center py-4 bg-light bg-opacity-50 rounded-4 border border-dashed">
                    <p className="tiny text-muted mb-0">ไม่พบประวัติการสั่งจ่ายยาปัจจุบัน</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}
