import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("file") as Blob;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 1. Convert image to base64
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    // 2. Initialize Gemini 1.5 Pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      คุณคือผู้เชี่ยวชาญด้านการอ่านผลแล็บ (Lab Result OCR Specialist) ของ TSPI Clinic
      หน้าที่ของคุณคือสกัดข้อมูลจากรูปภาพผลตรวจเลือด/ผลแล็บที่ได้รับ ให้กลายเป็นข้อมูล JSON
      
      โครงสร้าง JSON ที่ต้องการ:
      {
        "test_date": "YYYY-MM-DD",
        "hospital_name": "...",
        "results": [
          { "parameter": "Glucose", "value": 100, "unit": "mg/dL", "reference_range": "70-100", "status": "Normal|High|Low" },
          ...
        ],
        "axis_analysis": [
          { "axis_id": "AXIS_1", "reason": "Glucose สูงบ่งบอกถึง metabolic inflammation" }
        ]
      }
      
      โปรดสกัดข้อมูลทุกตัวที่ปรากฏในภาพอย่างแม่นยำ หากข้อมูลไม่ชัดเจนให้ระบุ status ว่า "Unclear"
    `;

    // 3. Generate Content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean JSON output (Gemini often wraps in ```json ... ```)
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultData = JSON.parse(jsonString);

    // 🕵️‍♂️ Audit Logging
    const { logAudit } = require("@/utils/firebase/audit");
    await logAudit({
      action: "LAB_OCR_PROCESSED",
      details: { 
        parameters_found: resultData.results?.length,
        axis_count: resultData.axis_analysis?.length 
      },
      metadata: { model: "gemini-1.5-flash" }
    });

    return NextResponse.json(resultData);
  } catch (error: any) {
    console.error("Lab OCR Error:", error);
    return NextResponse.json({ error: "OCR Processing Failed" }, { status: 500 });
  }
}
