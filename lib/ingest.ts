import Groq from "groq-sdk";
import { Case } from "@/lib/types"; 
import { saveDb, getDb } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function ingestClientFile(rawText: string) {
  const prompt = `
    You are a Data Entry Agent. Extract data from this client file.

    TEXT:
    ${rawText}

    TASK:
    1. Extract standard details (Name, Provider, Policy, Risks, Goals).
    
    2. **CRITICAL: ACTION EXTRACTION**
       - Look for sections titled "UPCOMING ACTIONS", "RECOMMENDATIONS", "Before Next Review", "At Next Review", or similar.
       - **EXTRACT EVERY SINGLE BULLET POINT** from these sections. Do NOT limit the number.
       - Format each item by prefixing it with its timeframe/heading to keep context.
       
       

    OUTPUT JSON STRUCTURE:
    {
      "clientName": "Name",
      "providerName": "Provider",
      "policyNumber": "Policy",
      "urgency": "high" | "normal",
      "clientContext": {
         "netWorth": "Value",
         "incomeSummary": "Value",
         "goals": ["Goal 1", "Goal 2",...],
         "risks": ["Risk 1", "Risk 2",...],
         "nextSteps": ["String 1", "String 2", "String 3", "String 4", "String 5..."] 
      },
      "latestLog": "Summary of recent comms"
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [
        { role: "system", content: "You are a JSON extractor. Be exhaustive with lists." }, 
        { role: "user", content: prompt }
    ],
    model: "openai/gpt-oss-120b", 
    response_format: { type: "json_object" },
  });

  const extracted = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const ctx = extracted.clientContext || {};

  const newCase: Case = {
    id: `case-${Date.now()}`,
    clientName: extracted.clientName || "Unknown",
    providerName: extracted.providerName || "General Portfolio",
    policyNumber: extracted.policyNumber || "Pending",
    status: 'discovery',
    urgency: extracted.urgency || 'normal',
    dateCreated: new Date().toISOString(),
    lastUpdateDate: new Date().toISOString(),
    nextActionDate: new Date().toISOString(),
    
    clientContext: {
      netWorth: ctx.netWorth,
      incomeSummary: ctx.incomeSummary,
      goals: ctx.goals || [],
      risks: ctx.risks || [],
      // This will now contain ALL items from the list, properly prefixed
      nextSteps: ctx.nextSteps || ["General Review"], 
      occupations: ctx.occupations || [],
      protection: ctx.protection || [],
      notes: ctx.notes
    },
    
    history: [
      {
        id: '1',
        date: new Date().toISOString(),
        actor: 'Agent',
        action: extracted.latestLog || "Imported client file."
      }
    ]
  };

  const db = getDb();
  db.cases.push(newCase);
  saveDb(db);

  return newCase;
}