import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { db } from "@/utils/firebase/client"; // Note: Use admin SDK for production server routes, but keeping client for now as per current project pattern
import { collection, query, where, getDocs } from "firebase/firestore";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { patientId, symptoms, preferredDate } = await req.json();

    // 1. Analyze Symptoms to determine Urgency & Duration
    const analysisResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a Medical Appointment Triage AI. 
          Analyze the symptoms and return a JSON object:
          {
            "urgencyScore": 1-10,
            "recommendedDuration": 15 | 30 | 45 | 60,
            "reasoning": "short explanation",
            "suggestedSpecialty": "string"
          }`
        },
        { role: "user", content: symptoms }
      ],
      response_format: { type: "json_object" }
    });

    const aiAnalysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");

    // 2. Logic for "Smart Slot" selection (Mocked for now, in reality check doctor availability)
    // In a real app, we would query the doctors' existing appointments for that date
    
    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      slots: [
        { time: "09:00", status: "recommended", reason: "หมอพร้อมที่สุดในช่วงเช้า" },
        { time: "11:30", status: "available" },
        { time: "14:00", status: "available" }
      ]
    });

  } catch (error: any) {
    console.error("Scheduler API Error:", error);
    return NextResponse.json({ error: "Failed to schedule" }, { status: 500 });
  }
}
