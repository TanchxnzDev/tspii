import { z } from 'genkit';
import { ai } from './genkit';
import { precisionEngine } from './tspi-engine';
import { dbAdmin } from '@/utils/firebase/admin';
import axesData from '@/data/39_last_x.json';

// 🧬 Define the Precision Medicine Digital Twin Schema
export const DigitalTwinSchema = z.object({
  patientId: z.string(),
  snapshotId: z.string(),
  timestamp: z.string(),
  axesState: z.record(z.object({
    score: z.number(),
    severity: z.string(),
    trend: z.enum(['Improving', 'Stable', 'Declining']).optional()
  })),
  mechanisticInsights: z.string(),
  recommendedProtocol: z.array(z.object({
    moduleId: z.string(),
    name: z.string(),
    rationale: z.string(),
    priority: z.number()
  }))
});

export const precisionMedicineFlow = ai.defineFlow(
  {
    name: 'precisionMedicineFlow',
    inputSchema: z.object({
      patientId: z.string(),
      rawInput: z.string().optional(), // Text from doctor/patient
      labData: z.any().optional(),     // Structured lab data
      voiceTranscript: z.string().optional()
    }),
    outputSchema: DigitalTwinSchema,
  },
  async (input) => {
    console.log(`🧬 Starting Precision Medicine Flow for Patient: ${input.patientId}`);

    // --- PHASE 1: INTELLIGENT INTAKE (Groq) ---
    // Groq is used for fast parsing of raw medical notes
    const intakeResult = await ai.generate({
      model: 'groq/llama-3.3-70b-versatile', // Use centralized alias
      prompt: `Analyze the following patient data and extract key symptoms and clinical observations: ${input.rawInput || input.voiceTranscript}`,
      output: { schema: z.object({ symptoms: z.array(z.string()), observations: z.string() }) }
    });

    const processedData = {
      labs: input.labData || {},
      symptoms: intakeResult.output?.symptoms || [],
      observations: intakeResult.output?.observations || ""
    };

    // --- PHASE 2: DETERMINISTIC ENGINE (The Core Logic) ---
    // Run the 39-axis mechanistic analysis
    const engineResult = await precisionEngine.runFullAnalysis(input.patientId, processedData);

    const domainSummary = Object.entries(engineResult.domainIndices)
      .map(([id, score]) => {
        // id is "DOMAIN_1", "DOMAIN_2" etc — match numeric domain_id
        const numericId = parseInt(id.replace('DOMAIN_', ''));
        const dDef = (axesData as any).domains.find((d: any) => d.domain_id === numericId);
        return `${dDef?.title || id}: ${score}%`;
      });

    const criticalAxes = Object.entries(engineResult.axesScores)
      .filter(([_, val]) => val.score > 60)
      .map(([id, val]) => {
        const aDef = precisionEngine.getAxisDef(id);
        return `${aDef?.name || id}: ${val.score}% (${val.severity})`;
      });

    const deepSeekAnalysis = await ai.generate({
      model: 'groq/llama-3.3-70b-versatile', 
      system: `You are the TSPI Precision Medicine AI Engine. Perform Systems Biology Analysis.
               Focus on these high-burden domains: ${domainSummary.join(', ')}
               Critical Axes detected: ${criticalAxes.join(', ')}`,
      prompt: `Patient Symptoms: ${processedData.symptoms.join(', ')}
               Observations: ${processedData.observations}
               Based on the biological data, provide a deep mechanistic synthesis.
               Explain the "Network Effect" (how critical axes are interconnected).`,
    });

    // --- PHASE 4: MODULE ORCHESTRATION ---
    // Match the analysis with our 245 modules (Using Deterministic Ranking for now)
    const topModules = precisionEngine.recommendModules(engineResult.axesScores);
    
    // Bypass Claude refinement as requested by the user
    const finalProtocol = topModules.slice(0, 6).map(m => ({
      moduleId: m.id || m.name,
      name: m.name,
      rationale: `Targeting axes: ${m.coveredAxes.join(', ')} with synergy score ${m.synergyScore.toFixed(2)}`,
      priority: Math.round(m.synergyScore * 100)
    }));

    console.log("✅ Analysis complete, generating snapshot...");

    // --- PHASE 5: DIGITAL TWIN SNAPSHOT ---
    const snapshot = {
      patientId: input.patientId,
      snapshotId: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      axesState: Object.fromEntries(
        Object.entries(engineResult.axesScores).map(([id, data]) => [
          id, { score: data.score, severity: data.severity }
        ])
      ),
      mechanisticInsights: deepSeekAnalysis.text,
      recommendedProtocol: finalProtocol
    };

    try {
      // Store in Firestore (Digital Twin History)
      if (dbAdmin) {
        console.log(`💾 Saving snapshot to Firestore for patient: ${input.patientId}`);
        await dbAdmin.collection('patients')
          .doc(input.patientId)
          .collection('digitalTwin')
          .add(snapshot);
        console.log("✅ Snapshot saved successfully.");
      } else {
        console.warn("⚠️ Firestore dbAdmin is not initialized. Skipping save.");
      }
    } catch (fsError) {
      console.error("❌ Firestore Save Error:", fsError);
      // We still return the snapshot even if save fails, so the UI can show it
    }

    return snapshot;
  }
);
