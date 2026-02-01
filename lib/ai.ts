import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
    model: "llama3-8b-8192",
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}