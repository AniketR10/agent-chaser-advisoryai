import { DbSchema, LogEntry } from "./types";
import { saveDb } from "./db";

export function runAgentCycle(db: DbSchema) {
  const now = new Date(db.virtualDate);
  let actionsTaken = 0;

  db.cases = db.cases.map((c) => {
    const updatedCase = { ...c };
    
    if (c.status === 'loa-sent-client') {
      if (Math.random() > 0.5) {
        updatedCase.history.push(createLog(now, 'Agent', 'Client has not signed. Sent SMS reminder.'));
        updatedCase.lastUpdateDate = now.toISOString();
        actionsTaken++;
      } else {
      }
    }

    else if (c.status === 'loa-sent-provider') {
      if (Math.random() > 0.5) {
        updatedCase.status = 'provider-ack';
        updatedCase.lastUpdateDate = now.toISOString();
        updatedCase.history.push(createLog(now, 'Provider', 'Received acknowledgement. SLA: 15 days.'));
        actionsTaken++;
      }
    }

    return updatedCase;
  });

  saveDb(db);
  return actionsTaken;
}

function createLog(date: Date, actor: LogEntry['actor'], action: string): LogEntry {
  return {
    id: Math.random().toString(36).slice(2, 9),
    date: date.toISOString(),
    actor,
    action
  };
}