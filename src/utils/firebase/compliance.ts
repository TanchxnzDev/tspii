import { db } from "@/utils/firebase/client";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Initialize PDPA Consent Versions
 */
export const initializePDPA = async () => {
    const consentRef = doc(db, "consents", "v1.0");
    await setDoc(consentRef, {
        version: "1.0",
        effectiveDate: serverTimestamp(),
        policies: [
            { id: "health_data", label: "ยินยอมให้เก็บข้อมูลสุขภาพและผลแล็บ", required: true },
            { id: "ai_analysis", label: "ยินยอมให้ AI ช่วยวิเคราะห์ข้อมูลเพื่อการรักษา", required: true },
            { id: "long_term_storage", label: "ยินยอมให้จัดเก็บข้อมูลระยะยาวเกิน 5 ปี", required: false },
            { id: "research", label: "ยินยอมให้นำข้อมูลไปใช้ในงานวิจัย (ไม่ระบุตัวตน)", required: false }
        ],
        active: true
    });
    console.log("✅ PDPA v1.0 Initialized");
};

/**
 * Initialize Doctor Schedules (Example)
 */
export const seedDoctorSchedule = async (doctorUid: string) => {
    const scheduleRef = doc(db, "doctor_schedules", `${doctorUid}_monday`);
    await setDoc(scheduleRef, {
        doctorId: doctorUid,
        day: "Monday",
        slots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
        max_patients_per_slot: 2,
        active: true
    });
    console.log("✅ Doctor Schedule Seeded");
};

/**
 * Record Patient Consent
 */
export const recordConsent = async (uid: string, choices: Record<string, boolean>, ip: string) => {
    const logRef = collection(db, `patients/${uid}/consent_logs`);
    await addDoc(logRef, {
        version: "1.0",
        choices: choices,
        ip: ip,
        channel: "web_app",
        consentedAt: serverTimestamp(),
        status: "accepted"
    });
};
