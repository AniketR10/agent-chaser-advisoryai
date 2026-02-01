'use server'

import { getDb, saveDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';
import { runAgentCycle } from '@/lib/agent';

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