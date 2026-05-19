import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { logAudit } from "@/utils/firebase/audit";
import { dbAdmin } from "@/utils/firebase/admin";

// 1. Initialize Engines
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const AXES_DEFINITIONS = `
1: Systemic Inflammatory Load, 2: Immune Homeostasis, 3: Viral/Bacterial Governance, 
4: Detoxification, 5: Biotransformation, 6: Oxidative Burden,
7: Glycemic Regulation, 8: Lipid Dynamics, 9: Energy/Mitochondrial Health,
10: Hormonal Balance, 11: Thyroid Economy, 12: Adrenal Reserve,
13: Gut Barrier Integrity, 14: Digestive Efficiency, 15: Microbiome Ecosystem,
16: Neuro-Chemical Balance, 17: Cognitive Reserve, 18: Sleep/Circadian Biology,
19: Cardiovascular Strength, 20: Microvascular Flow, 21: Endothelial Health,
22: Respiratory Dynamics, 23: Renal/Fluid Balance, 24: Hepatic Architecture,
25: Musculoskeletal Integrity, 26: Bone Density/Mineral, 27: Connective Tissue,
28: Skin Barrier, 29: Visual Health, 30: Auditory Function,
31: Lymphatic Drainage, 32: Cellular Cycle/Autophagy, 33: Epigenetic Resilience,
34: Longevity/Senescence, 35: Stem Cell Vitality, 36: Bio-Energetic Flow,
37: Clinical Context A, 38: Clinical Context B, 39: Precision Outcome
`.trim();

export async function POST(req: Request) {
  try {
    const { messages = [], patientId, clinicalContext, engine = "groq", options = {} } = await req.json();

    // 🛡️ 1. Prepare initial messages
    const baseMessages = messages.length > 0 ? [...messages] : [{ role: "user", content: "เริ่มการวิเคราะห์คนไข้" }];
    
    let patientContext = "";
    
    // 🧬 2. Build Patient Context
    if (clinicalContext) {
      patientContext = `
[DIRECT CLINICAL CONTEXT]
Patient: ${clinicalContext.patientName} (HN: ${clinicalContext.hn})
Symptoms: ${clinicalContext.symptoms || "N/A"}
Current Axes: ${JSON.stringify(clinicalContext.axes || {})}
      `.trim();
    } 
    else if (patientId && dbAdmin) {
      const patientDoc = await dbAdmin.collection("patients").doc(patientId).get();
      const patientData = patientDoc.exists ? patientDoc.data() : null;
      const intakes = await dbAdmin.collection("tspi_clinical_intakes")
        .where("patientId", "==", patientId)
        .limit(3).get();
      const sessionSummaries = intakes.docs.map(d => d.data().summary).join("\n---\n");

      patientContext = `
[PATIENT CLINICAL RECORD]
Name: ${patientData?.fname || "N/A"} ${patientData?.lname || "N/A"}
Symptoms: ${patientData?.symptoms || "N/A"}
Recent Summaries: ${sessionSummaries || "No recent summaries"}
Axes: ${JSON.stringify(patientData?.axes || {})}
      `.trim();
    }

    // 🧠 3. Final Orchestration
    const systemInstruction = `You are the TSPI Precision Medicine AI Specialist. 
    Analyze using the 39-Axis Framework: ${AXES_DEFINITIONS}
    
    DIRECTIVES:
    1. PROFESSIONAL THAI ONLY.
    2. NETWORK EFFECT ANALYSIS.
    3. NO HALLUCINATIONS.
    
    ${options.systemInstruction || ""}
    `.trim();

    const enhancedMessages = [...baseMessages];
    if (patientContext && enhancedMessages.length > 0) {
      const lastIdx = enhancedMessages.length - 1;
      const userQuery = enhancedMessages[lastIdx].content;
      enhancedMessages[lastIdx].content = `
[CONTEXT]
${patientContext}

[MISSION]
${userQuery}
      `.trim();
    }

    const finalMessages = [{ role: "system", content: systemInstruction }, ...enhancedMessages];

    let responseContent = "";
    let modelName = "";

    if (engine === "groq") {
      modelName = "llama-3.3-70b-versatile";
      const res = await groq.chat.completions.create({
        model: modelName,
        messages: finalMessages,
        ...options
      });
      responseContent = res.choices[0].message.content || "";
    } 
    else if (engine === "deepseek") {
      modelName = "deepseek-chat";
      const res = await deepseek.chat.completions.create({
        model: modelName,
        messages: finalMessages,
        ...options
      });
      responseContent = res.choices[0].message.content || "";
    } 
    else {
      modelName = "gemini-1.5-pro";
      const model = genAI.getGenerativeModel({ model: modelName });
      const lastMsg = enhancedMessages[enhancedMessages.length - 1].content;
      const result = await model.generateContent(lastMsg);
      const res = await result.response;
      responseContent = res.text();
    }

    await logAudit({
      action: "AI_ANALYSIS",
      details: { engine, model: modelName, patientId },
      metadata: { model: modelName }
    });

    return NextResponse.json({ content: responseContent, engine, model: modelName });
  } catch (error: any) {
    console.error("AI Brain Critical Error:", error);
    return NextResponse.json({ 
      error: "AI Brain Coordination Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
