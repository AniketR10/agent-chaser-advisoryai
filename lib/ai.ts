import Groq from "groq-sdk";
import { Case } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
    console.error("Script Gen Error:", error);
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

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful JSON-speaking assistant." },
        { role: "user", content: prompt },
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      analysis: "Error analyzing document",
      logEntry: "Analysis Failed",
      newStatus: caseContext.status,
      callScript: null
    };
  }
}