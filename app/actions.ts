'use server'

import { getDb, saveDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';
import { runAgentCycle } from '@/lib/agent';
import { analyzeDocumentWithGroq } from '@/lib/ai';
import { LogEntry } from '@/lib/types';

export async function resetSimulation() {
  seedDatabase();
  revalidatePath('/'); 
}

export async function advanceTime(days: number) {
  const db = getDb();
  
  const newDate = addDays(new Date(db.virtualDate), days);
  db.virtualDate = newDate.toISOString();
  
  
  saveDb(db);
  revalidatePath('/');
}

export async function triggerAgent() {
  const db = getDb();
  
  const actionsCount = runAgentCycle(db);
  
  revalidatePath('/');
  
  return { success: true, count: actionsCount };
}

export async function getDashboardData() {
  return getDb();
}

export async function generateCallScript(caseId: string) {
  const db = getDb();
  const c = db.cases.find(x => x.id === caseId);
  
  if (!c) return "Error: Case not found";

  await new Promise(resolve => setTimeout(resolve, 1500));

  return `
**Call Script for ${c.providerName}**
**Ref:** ${c.policyNumber} (Client: ${c.clientName})

**Opener:**
"Hi, I'm calling to chase the LOA for ${c.clientName}, policy number ${c.policyNumber}. This was sent on ${new Date(c.dateCreated).toLocaleDateString()}."

**The Problem:**
"It has been ${c.urgency === 'high' ? 'over 15 days' : 'a week'} since we sent this. My client is waiting."

**The Ask:**
"I need you to confirm on this call that the transfer value will be issued by Friday. Please do not tell me '10 working days' as that deadline has passed."
  `.trim();
}

export async function uploadProviderDocument(formData: FormData) {
  const caseId = formData.get('caseId') as string;
  const file = formData.get('file') as File;

  if (!file || !caseId) return { success: false, message: "Missing data" };

  // 1. Read the file (For demo stability, we assume it's text-readable)
  const textContent = await file.text();

  // 2. Get current case context
  const db = getDb();
  const currentCase = db.cases.find(c => c.id === caseId);
  if (!currentCase) return { success: false, message: "Case not found" };

  // 3. Ask Groq to analyze
  // (We use a try/catch block so the demo doesn't crash if API fails)
  try {
    const aiResult = await analyzeDocumentWithGroq(textContent, currentCase);

    // 4. Update the Database based on AI Logic
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      actor: 'Agent',
      action: aiResult.logEntry || "Analyzed uploaded document"
    };

    currentCase.history.push(newLog);
    
    // If AI suggests a status change, apply it
    // (You would map 'suggested_status_code' to your real types here)
    if (aiResult.newStatus === 'completed' || aiResult.newStatus === 'provider-ack') {
      currentCase.status = 'provider-ack'; 
    }

    saveDb(db);
    revalidatePath('/');
    
    return { 
      success: true, 
      script: aiResult.callScript,
      analysis: aiResult.analysis 
    };

  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, message: "AI Analysis Failed" };
  }
}