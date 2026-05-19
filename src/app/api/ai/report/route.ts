import { NextResponse } from 'next/server';
import { clinicalReportFlow } from '@/lib/report-flow';

/**
 * API Route to trigger the Multi-Model Clinical Report
 * Powered by DeepSeek (Logic) & Claude (Writing)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, patientData, reportType } = body;

    if (!patientId || !patientData) {
      return NextResponse.json({ error: "Missing required patient data" }, { status: 400 });
    }

    console.log(`🚀 Starting Multi-Model Analysis for Patient: ${patientId}`);
    
    const result = await clinicalReportFlow({
      patientId,
      patientData,
      reportType: reportType || 'Physician'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ AI Report Error:", error);
    return NextResponse.json({ 
      error: "AI Engine failed to process report", 
      details: error.message 
    }, { status: 500 });
  }
}
