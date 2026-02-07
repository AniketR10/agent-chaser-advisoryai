import Groq from "groq-sdk";
import { Case, CaseStatus } from "./types"; 

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function ingestClientFile(rawText: string): Promise<Case> {
  const prompt = `
    You are a Data Entry Agent for a Financial Advisor.
    Extract deep insight from the client file text below.

    TEXT:
    ${rawText}

    TASK:
    1. Extract standard details (Name, Provider, Policy, Risks, Goals).
    
    2. **CRITICAL: ACTION EXTRACTION**
       - Look for sections titled "UPCOMING ACTIONS", "RECOMMENDATIONS", "Before Next Review", "At Next Review", or similar.
       - **EXTRACT EVERY SINGLE BULLET POINT** from these sections. Do NOT limit the number.
       - Format each item by prefixing it with its timeframe/heading to keep context (e.g., "RECOMMENDATIONS: Reduce mortgage term").
       - Be exhaustive.

    3. Extract 'nextActionDate' by looking for "Next Review:" or future dates.

    OUTPUT JSON STRUCTURE:
    {
      "clientName": "Name",
      "providerName": "Provider",
      "policyNumber": "Policy/Client ID",
      "status": "discovery",
      "clientContext": {
         "netWorth": "Value",
         "incomeSummary": "Value",
         "goals": ["Goal 1", "Goal 2"],
         "risks": ["Risk 1", "Risk 2"],
         "occupations": ["Name: Job (£Income)"],
         "protection": ["Name: Cover Amount"],
         "nextSteps": ["Action 1", "Action 2", "Action 3"],
         "nextActionDate": "YYYY-MM-DD or string",
         "notes": "Brief summary of sensitive notes"
      },
      "latestLog": "Summary of recent comms or 'Imported client file'"
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [
        { role: "system", content: "You are a JSON extractor. Be exhaustive with action lists." }, 
        { role: "user", content: prompt }
    ],
    model: "openai/gpt-oss-120b", 
    response_format: { type: "json_object" },
  });

  const extracted = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const ctx = extracted.clientContext || {};

  const newCase: Case = {
    id: crypto.randomUUID(),
    clientName: extracted.clientName || "Unknown Client",
    providerName: extracted.providerName || "General Portfolio",
    policyNumber: extracted.policyNumber || "Pending",
    
    status: (extracted.status as CaseStatus) || 'discovery',
    
    dateCreated: new Date().toISOString(),
    lastUpdateDate: new Date().toISOString(),
    nextActionDate: ctx.nextActionDate || "Not Scheduled",
    suggestedNextAction: ctx.nextSteps?.[0] || "Review initial file",
    
    clientContext: {
      netWorth: ctx.netWorth,
      incomeSummary: ctx.incomeSummary,
      goals: ctx.goals || [],
      risks: ctx.risks || [],
      nextSteps: ctx.nextSteps || ["General Review"], 
      completedSteps: [],
      occupations: ctx.occupations || [],
      protection: ctx.protection || [],
      notes: ctx.notes,
      nextReviewDate: ctx.nextActionDate
    },
    
    history: [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        actor: 'Agent',
        action: extracted.latestLog || "Imported client file."
      }
    ]
  };

  return newCase;
}