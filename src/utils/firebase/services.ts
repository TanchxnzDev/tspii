import { db } from "./client";
import { scheduleAutomation } from "./automations";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    addDoc,
    onSnapshot,
    DocumentData,
    QuerySnapshot,
} from "firebase/firestore";

// ==================== PATIENTS ====================

export const getPatient = async (uid: string) => {
    const snap = await getDoc(doc(db, "patients", uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllPatients = async () => {
    const snap = await getDocs(collection(db, "patients"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createPatient = async (uid: string, data: any) => {
    await setDoc(doc(db, "patients", uid), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
};

export const updatePatient = async (uid: string, data: any) => {
    await updateDoc(doc(db, "patients", uid), {
        ...data,
        updatedAt: new Date().toISOString(),
    });
};

// ==================== DOCTORS ====================

export const getDoctor = async (uid: string) => {
    const snap = await getDoc(doc(db, "doctors", uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllDoctors = async () => {
    const snap = await getDocs(collection(db, "doctors"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ==================== APPOINTMENTS ====================

export const getAppointments = async (date?: string) => {
    let q = query(collection(db, "appointments"), orderBy("time", "asc"));
    if (date) {
        q = query(q, where("date", "==", date));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createAppointment = async (data: any) => {
    const ref = await addDoc(collection(db, "appointments"), {
        ...data,
        status: data.status || "pending",
        urgencyScore: data.urgencyScore || 0,
        expectedDuration: data.expectedDuration || 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const appointmentId = ref.id;

    // 🤖 Automate Clinical Tasks
    const apptDate = new Date(`${data.date}T${data.time}`);
    
    // 1. No-show check (1 hour after appt)
    const noShowTime = new Date(apptDate.getTime() + 60 * 60 * 1000);
    await scheduleAutomation(appointmentId, "NO_SHOW_CHECK", noShowTime);

    // 2. Follow-up (3 days after appt)
    const followUpTime = new Date(apptDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    await scheduleAutomation(appointmentId, "FOLLOW_UP", followUpTime, { day: 3 });

    return appointmentId;
};


export const updateAppointment = async (id: string, data: any) => {
    await updateDoc(doc(db, "appointments", id), {
        ...data,
        updatedAt: new Date().toISOString(),
    });
};


// ==================== LAB RESULTS ====================

export const getLabResults = async (patientId?: string) => {
    let q = query(collection(db, "lab_results"), orderBy("createdAt", "desc"));
    if (patientId) {
        q = query(q, where("patientId", "==", patientId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createLabResult = async (data: any) => {
    const ref = await addDoc(collection(db, "lab_results"), {
        ...data,
        createdAt: new Date().toISOString(),
    });
    return ref.id;
};

// ==================== ENGINE RESULTS ====================

export const getEngineResults = async () => {
    const snap = await getDocs(
        query(collection(db, "engine_results"), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createEngineResult = async (data: any) => {
    const ref = await addDoc(collection(db, "engine_results"), {
        ...data,
        createdAt: new Date().toISOString(),
    });
    return ref.id;
};

// ==================== AXES / MODULES ====================

export const getAxes = async () => {
    // ✅ Updated to tspi_axes_v4 (39-axis framework)
    const snap = await getDocs(collection(db, "tspi_axes_v4"));
    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        // Normalize field names for UI compatibility
        name: d.data().name,
        axis_id: d.data().axis_id,
        domain_title: d.data().domain_title
    }));
};

export const getModules = async () => {
    // ✅ Updated to tspi_modules_v4 (200-module library)
    const snap = await getDocs(collection(db, "tspi_modules_v4"));
    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        // Normalize field names for UI compatibility
        name: d.data()["Product Derived From"] || d.data().name || d.id,
        module_code: d.data()["PhytoCore Code"] || d.id,
        tspi_axis_mapping: d.data()["TSPI Axis Mapping"] || ""
    }));
};

// ==================== ANALYTICS / STATS ====================

export const getDashboardStats = async () => {
    const [patientsSnap, urgentSnap, axesSnap, modulesSnap] = await Promise.all([
        getDocs(collection(db, "patients")),
        getDocs(query(collection(db, "patients"), where("status", "==", "เคสด่วน"))),
        getDocs(collection(db, "tspi_axes_v4")),
        getDocs(collection(db, "tspi_modules_v4"))
    ]);

    const today = new Date().toISOString().split("T")[0];
    const todayAppts = await getAppointments(today);

    return {
        total_patients: patientsSnap.size,
        urgent_cases: urgentSnap.size,
        active_now: todayAppts.length,
        completion_rate: patientsSnap.size > 0 ? "100%" : "0%",
        total_axes: axesSnap.size,
        total_modules: modulesSnap.size
    };
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribePatients = (
    callback: (data: any[]) => void
) => {
    return onSnapshot(collection(db, "patients"), (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
};

export const subscribeAppointments = (
    date: string,
    callback: (data: any[]) => void
) => {
    const q = query(
        collection(db, "appointments"),
        where("date", "==", date),
        orderBy("time", "asc")
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
};
