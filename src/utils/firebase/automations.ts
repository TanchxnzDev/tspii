import { db } from "./client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AutomationType = "FOLLOW_UP" | "NO_SHOW_CHECK" | "CONFIRMATION_REMINDER";

export const scheduleAutomation = async (
  appointmentId: string,
  type: AutomationType,
  scheduledFor: Date,
  payload: any = {}
) => {
  try {
    await addDoc(collection(db, "appointment_automations"), {
      appointmentId,
      type,
      status: "pending",
      scheduledFor: scheduledFor.toISOString(),
      payload,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Scheduled ${type} for appointment ${appointmentId}`);
  } catch (error) {
    console.error("❌ Failed to schedule automation:", error);
  }
};
