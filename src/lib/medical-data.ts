import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/utils/firebase/client';

/**
 * TSPI Medical Data Schema (PDPA & Clinical Intelligence Compliant)
 */

export interface BiologicalScore {
  axisId: number;
  axisName: string;
  score: number; // 0-100
  updatedAt: any;
  markers: Record<string, any>;
}

// ... interfaces remain the same ...
export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  lastClinicalUpdate: any;
  axes: Record<string, BiologicalScore>; // Key is Axis ID
  reports?: string[]; // IDs of ClinicalReport
  caseSummary?: string; // AI generated case summary
}

/**
 * Helper to get DB and Timestamp based on Environment
 */
const getDb = async () => {
  if (typeof window === "undefined") {
    const { dbAdmin } = await import("@/utils/firebase/admin");
    const admin = await import("firebase-admin");
    return { 
      isServer: true, 
      db: dbAdmin, 
      Timestamp: admin.firestore.Timestamp 
    };
  }
  return { isServer: false, db, Timestamp };
};

export const medicalDb = {
  // --- Patient Management ---
  async getPatient(id: string): Promise<PatientProfile | null> {
    const { isServer, db: activeDb } = await getDb();
    
    if (isServer) {
      const docSnap = await (activeDb as any).collection('patients').doc(id).get();
      return docSnap.exists ? (docSnap.data() as PatientProfile) : null;
    } else {
      const docRef = doc(db, 'patients', id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as PatientProfile) : null;
    }
  },

  async updateBiologicalScores(patientId: string, scores: Record<string, BiologicalScore>) {
    const { isServer, db: activeDb, Timestamp: activeTimestamp } = await getDb();
    
    if (isServer) {
      await (activeDb as any).collection('patients').doc(patientId).update({
        axes: scores,
        lastClinicalUpdate: activeTimestamp.now()
      });
    } else {
      const docRef = doc(db, 'patients', patientId);
      await updateDoc(docRef, {
        axes: scores,
        lastClinicalUpdate: Timestamp.now()
      });
    }
  },

  // --- Audit Logging ---
  async logAccess(actorId: string, targetId: string, action: string, layer: 'A' | 'B' | 'C' | 'D' | 'E') {
    const { isServer, db: activeDb, Timestamp: activeTimestamp } = await getDb();
    const logData = {
      timestamp: activeTimestamp.now(),
      actorId,
      targetId,
      action,
      layer,
      clientIp: isServer ? 'server-side' : 'client-side',
      governanceStatus: layer === 'E' ? 'RESTRICTED_INTERNAL' : 'PATIENT_ACCESSIBLE'
    };

    if (isServer) {
      await (activeDb as any).collection('audit_logs').add(logData);
    } else {
      await addDoc(collection(db, 'audit_logs'), logData);
    }
  },

  async getPatientList(): Promise<any[]> {
    const { isServer, db: activeDb } = await getDb();
    if (isServer) {
      const snap = await (activeDb as any).collection('patients').get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } else {
      const snap = await getDocs(collection(db, 'patients'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  }
};
