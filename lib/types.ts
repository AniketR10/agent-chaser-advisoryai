
export type CaseStatus = 
  | 'discovery'  
  | 'loa-drafting'     
  | 'loa-sent-client' 
  | 'processing-loa'   
  | 'loa-sent-provider'
  | 'provider-ack'    
  | 'completed';      

export type Urgency = 'normal' | 'high' | 'critical';

export interface LogEntry {
  id: string;
  date: string;
  actor: 'Advisor' | 'Client' | 'Provider' | 'Agent';
  action: string;
  details?: string;
}

export interface ClientContext {
  netWorth?: string;        
  goals?: string[];        
  risks?: string[];        
  incomeSummary?: string;   
  notes?: string;     
}

export interface Case {
  id: string;
  clientName: string;
  providerName: string; 
  policyNumber: string;
  status: CaseStatus;
  urgency: Urgency;
  
  dateCreated: string;
  lastUpdateDate: string; 
  nextActionDate: string; 
  
  clientContext?: ClientContext; 
  
  history: LogEntry[];
}

export interface DbSchema {
  virtualDate: string; 
  cases: Case[];
}