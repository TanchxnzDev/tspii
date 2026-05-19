import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import os from "os";
import { logAudit } from "@/utils/firebase/audit";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is required for voice-to-form endpoint");
}

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // 1. Check file size (max 25MB for Groq Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 25MB)" }, { status: 400 });
    }

    // 2. Temporary save audio file
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const ext = audioFile.type.includes("webm") ? "webm" : "m4a";
    const tempFilePath = path.join(os.tmpdir(), `voice_${Date.now()}.${ext}`);
    await writeFile(tempFilePath, buffer);

    // 3. Transcribe using Groq Whisper (distil-whisper-large-v3-preview)
    const transcription = await groq.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: "distil-whisper-large-v3-preview",
      language: "th",
      response_format: "text",
    });

    // 4. Cleanup temp file
    await unlink(tempFilePath).catch(() => {});

    // 5. Structure the text using Llama-3.3-70B → SOAP Note JSON
    let structuredContent: Record<string, any> = {};
    try {
      const structuringResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `คุณคือ Medical Scribe ของ TSPI Clinic พูดไทย
หน้าที่: สรุป Transcript จากการซักประวัติเป็น SOAP Note JSON

รูปแบบ JSON ที่ต้องส่งกลับ:
{
  "subjective": "ข้อความที่คนไข้/หมอพูด (สรุปสั้น)",
  "objective": "ข้อมูลที่วัดได้/สังเกตได้ (ถ้ามี)",
  "assessment": "การประเมินเบื้องต้น (1-2 บรรทัด)",
  "plan": "สิ่งที่ต้องตรวจ/ทำต่อ (ถ้ามี)",
  "key_symptoms": ["อาการหลักที่พบ", "..."],
  "severity": "mild|moderate|severe",
  "summary_short": "สรุปสั้น 1 ประโยค"
}`,
          },
          { role: "user", content: `ช่วยสรุป transcript นี้เป็น SOAP Note: ${transcription}` },
        ],
        response_format: { type: "json_object" },
      });

      const raw = structuringResponse.choices[0].message.content || "{}";
      structuredContent = JSON.parse(raw);
    } catch (structErr) {
      console.warn("⚠️ SOAP structuring failed, returning raw transcription:", structErr);
      structuredContent = {
        subjective: transcription,
        assessment: "รอการสรุปโดยแพทย์",
        severity: "unknown",
        summary_short: transcription.slice(0, 120) + (transcription.length > 120 ? "..." : ""),
      };
    }

    // 6. Audit Logging (best-effort)
    try {
      await logAudit({
        action: "VOICE_TRANSCRIPTION",
        details: {
          transcript_length: transcription.length,
          has_structured_data: Object.keys(structuredContent).length > 0,
        },
        metadata: { model: "distil-whisper-large-v3-preview" },
      });
    } catch (auditErr) {
      console.warn("⚠️ Audit log skipped:", auditErr);
    }

    return NextResponse.json({
      text: transcription,
      summary: structuredContent.summary_short || structuredContent.subjective,
      structured: structuredContent,
    });
  } catch (error: any) {
    console.error("Voice-to-Form Error:", error);
    return NextResponse.json(
      { error: "Transcription Failed", details: error.message },
      { status: 500 }
    );
  }
}
