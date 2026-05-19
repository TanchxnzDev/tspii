import { db } from "./client";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";

export type AuditAction = 
    | "AI_INTAKE_REQUEST" 
    | "AI_INTAKE_RESPONSE" 
    | "LAB_OCR_PROCESSED" 
    | "VOICE_TRANSCRIPTION" 
    | "USER_CONSENT_ACCEPTED"
    | "DATA_ACCESS"
    | "ADMIN_ACTION";

/**
 * Log an action to the Audit Trail
 * Smart version: Uses Admin SDK on server, Client SDK on browser
 */
export const logAudit = async (data: {
    action: AuditAction;
    userId?: string;
    patientId?: string;
    details: any;
    metadata?: {
        model?: string;
        ip?: string;
        channel?: string;
    }
}) => {
    try {
        if (typeof window === "undefined") {
            // SERVER SIDE: Use Firebase Admin
            const { dbAdmin } = await import("./admin");
            const { FieldValue } = await import("firebase-admin/firestore");
            
            await dbAdmin.collection("audit_logs").add({
                ...data,
                timestamp: FieldValue.serverTimestamp(),
                version: "1.0.0-server"
            });
        } else {
            // CLIENT SIDE: Use Firebase Web SDK
            await addDoc(collection(db, "audit_logs"), {
                ...data,
                timestamp: serverTimestamp(),
                version: "1.0.0-client"
            });
        }
    } catch (err) {
        console.error("Failed to log audit:", err);
    }
};

/**
 * Fetch Audit Logs
 */
export const getAuditLogs = async (limitCount: number = 100) => {
    if (typeof window === "undefined") {
        const { dbAdmin } = await import("./admin");
        const snap = await dbAdmin.collection("audit_logs")
            .orderBy("timestamp", "desc")
            .limit(limitCount)
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
        const q = query(
            collection(db, "audit_logs"), 
            orderBy("timestamp", "desc"), 
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
};
