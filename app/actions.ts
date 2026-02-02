'use server'

import { getDb, saveDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';
import { runAgentCycle } from '@/lib/agent';
import { analyzeDocumentWithGroq } from '@/lib/ai';
import { ingestClientFile } from '@/lib/ingest';
import { LogEntry } from '@/lib/types';
import { generateScriptWithGroq } from '@/lib/ai';


export async function advanceTime(days: number) {
  const db = getDb();
  
  const newDate = addDays(new Date(db.virtualDate), days);
  db.virtualDate = newDate.toISOString();
  
  saveDb(db);
  revalidatePath('/');
}

export async function deleteCase(caseId: string) {
  const db = getDb();
  db.cases = db.cases.filter((c) => c.id !== caseId);
  saveDb(db);
  revalidatePath('/');
  return { success: true };
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

export async function generateCallScript(caseId: string, specificAction?: string) {
  const db = getDb();
  const c = db.cases.find(x => x.id === caseId);
  
  if (!c) return "Error: Case not found";

  try {
    const script = await generateScriptWithGroq(c, specificAction);
    return script;
  } catch (error) {
    return "Error: AI Service Unavailable";
  }
}

export async function completeActionStep(caseId: string, actionStep: string) {
  const db = getDb();
  const c = db.cases.find(x => x.id === caseId);
  
  if (!c || !c.clientContext) return { success: false };

  if (!c.clientContext.completedSteps) {
    c.clientContext.completedSteps = [];
  }

  if (!c.clientContext.completedSteps.includes(actionStep)) {
    c.clientContext.completedSteps.push(actionStep);
    
    const newLog: LogEntry = {
      id: Math.random().toString(36).slice(2, 11),
      date: new Date().toISOString(),
      actor: 'Agent',
      action: `Completed action: "${actionStep}"`
    };
    
    c.history.push(newLog);
  }

  saveDb(db);
  revalidatePath('/');
  return { success: true };
}

export async function uploadProviderDocument(formData: FormData) {
  const caseId = formData.get('caseId') as string;
  const file = formData.get('file') as File;

  if (!file || !caseId) return { success: false, message: "Missing data" };

  const textContent = await file.text();

  const db = getDb();
  const currentCase = db.cases.find(c => c.id === caseId);
  if (!currentCase) return { success: false, message: "Case not found" };

  try {
    const aiResult = await analyzeDocumentWithGroq(textContent, currentCase);

    const newLog: LogEntry = {
      id: Math.random().toString(36).slice(2, 11),
      date: new Date().toISOString(),
      actor: 'Agent',
      action: aiResult.logEntry || "Analyzed uploaded document"
    };

    currentCase.history.push(newLog);
    
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

export async function importNewClient(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { success: false, message: "No file uploaded" };
  }

  try {
    const text = await file.text();
    
    const newCase = await ingestClientFile(text);
    
    revalidatePath('/');
    
    return { success: true, caseId: newCase.id };
  } catch (error) {
    console.error("Ingest Failed:", error);
    return { success: false, message: "Failed to parse client file" };
  }
}