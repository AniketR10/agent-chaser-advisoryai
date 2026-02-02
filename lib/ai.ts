import Groq from "groq-sdk";
import { saveDb, getDb } from "./db";
import { Case } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function ingestClientFile(rawText: string) {
  const prompt = `
    You are a Data Entry Agent for a Financial Advisor.
    Extract deep insight from the client file text below.

    TEXT:
    ${rawText}

    TASK:
    Map the text to the following JSON structure. 
    1. 'goals': Extract all the goals (e.g. "Lexus upgrade", "Retire at 65").
    2. 'risks': All the health issues (e.g. "Back problems") or job concerns.
    3. 'occupations': Combine Name + Job Title + Income if available.
    4. 'protection': Summarize Life Cover or Critical Illness details.

    OUTPUT JSON STRUCTURE:
    {
      "clientName": "Name & Name",
      "providerName": "Largest pension provider mentioned (or 'General Portfolio')",
      "policyNumber": "Policy number if found (or 'Pending')",
      "status": "discovery",
      "clientContext": {
         "netWorth": "Total Net Worth Value",
         "incomeSummary": "Household Income Value",
         "goals": ["Goal 1", "Goal 2", "Goal 3", "Goal 4",...],
         "risks": ["Risk 1", "Risk 2", "Risk 3", "Risk 4"],
         "occupations": ["Alan: Radio Presenter (£68k)", "Lynne: Receptionist"],
         "protection": ["Alan: £200k Life Cover", "Lynne: £150k Life Cover"],
         "nextReviewDate": "Date from top of file",
         "notes": "Brief summary of sensitive notes (e.g. 'No children')"
      },
      "latestLog": "Summary of the most recent item in 'Recent Communication'"
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [
        { role: "system", content: "You are a JSON extractor." }, 
        { role: "user", content: prompt }
    ],
    model: "openai/gpt-oss-120b",
    response_format: { type: "json_object" },
  });

  const extracted = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const ctx = extracted.clientContext || {};

  const newCase: Case = {
    id: `case-${Date.now()}`,
    clientName: extracted.clientName || "Unknown Client",
    providerName: extracted.providerName || "General Portfolio",
    policyNumber: extracted.policyNumber || "Pending",
    status: extracted.status || 'discovery',
    dateCreated: new Date().toISOString(),
    lastUpdateDate: new Date().toISOString(),
    nextActionDate: new Date().toISOString(),
    
    clientContext: {
      netWorth: ctx.netWorth,
      incomeSummary: ctx.incomeSummary,
      goals: ctx.goals || [],
      risks: ctx.risks || [],
      occupations: ctx.occupations || [],
      protection: ctx.protection || [],
      nextReviewDate: ctx.nextReviewDate,
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

export async function generateScriptWithGroq(c: Case, actionFocus?: string) {
  
  const dateSent = new Date(c.dateCreated).toLocaleDateString('en-GB');
  
  const taskDescription = actionFocus 
    ? `Write a specific script/email to address this action: "${actionFocus}".`
    : `Write a standard follow-up script chasing the LOA sent on ${dateSent}.`;

  const prompt = `
    You are an expert UK Financial Advisor Assistant.
    
    CONTEXT:
    - Client: ${c.clientName} (Refer as "my client")
    - Provider: ${c.providerName}
    - Risks: ${c.clientContext?.risks?.join(", ") || "None"}
    - Goals: ${c.clientContext?.goals?.join(", ") || "None"}

    TASK:
    ${taskDescription}

    TONE: Professional, Firm, Action-Oriented.
    FORMAT: Plain text. No markdown. Use Uppercase Headers.
    
    STRUCTURE:
    OPENER
    (Context of why we are contacting)
    
    THE CONTEXT
    (Why this action is necessary for the client's goals/risks)
    
    THE NEXT STEP
    (Clear instruction on what needs to happen)
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful financial assistant. Plain text only." },
        { role: "user", content: prompt },
      ],
      model: "openai/gpt-oss-120b", 
    });
    return completion.choices[0]?.message?.content || "Failed to generate script.";
  } catch (error) {
    return "Error generating script.";
  }
}


export async function analyzeDocumentWithGroq(fileContent: string, caseContext: any) {
  const prompt = `
  You are an expert UK Financial Advisor Assistant.
  
  CONTEXT:
  Client: ${caseContext.clientName}
  Provider: ${caseContext.providerName}
  Policy: ${caseContext.policyNumber}
  Current Status: ${caseContext.status}

  TASK:
  Analyze the following document content received from the provider/client.
  1. Determine what the document is (LOA, rejection, partial info).
  2. Decide if this resolves the current bottleneck.
  3. Generate a very short log entry (max 10 words) for the system history.
  4. If the document is incomplete or a rejection, write a "Call Script" for the advisor to chase them. If it is valid, script is "None".

  DOCUMENT CONTENT:
  "${fileContent}"

  OUTPUT JSON FORMAT:
  {
    "analysis": "Brief summary",
    "logEntry": "Actionable short log",
    "newStatus": "suggested_status_code",
    "callScript": "Full script if needed, or null"
  }
  `;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful JSON-speaking assistant." },
      { role: "user", content: prompt },
    ],
    model: "openai/gpt-oss-120b",
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}