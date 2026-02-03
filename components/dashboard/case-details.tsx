'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Case, LogEntry } from "@/lib/types" 
import { formatDistanceToNow } from "date-fns"
import { 
  Bot, User, Building2, FileText, Copy, 
  AlertTriangle, Target, Wallet, ListTodo, Loader2, Sparkles, Check, X, CalendarClock, CheckCircle2
} from "lucide-react"
import { useState, useEffect } from "react"
import { generateCallScript, completeActionStep } from "@/app/actions"
import { useRouter } from "next/navigation"

interface CaseDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  caseData: Case | null
}

export function CaseDetailsDialog({ isOpen, onClose, caseData }: CaseDetailsDialogProps) {
  const router = useRouter()
  
  const [script, setScript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [scriptSourceAction, setScriptSourceAction] = useState<string | null>(null);
  
  const [localCompleted, setLocalCompleted] = useState<string[]>([]);
  const [localHistory, setLocalHistory] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isOpen && caseData) {
      setLocalCompleted(caseData.clientContext?.completedSteps || []);

      const sortedHistory = [...(caseData.history || [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setLocalHistory(sortedHistory);
      setScript(null);
      setScriptSourceAction(null);
    }
  }, [isOpen, caseData]);

  if (!caseData) return null

  const visibleHistory = [...localHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleGenerateScript = async (actionItem?: string) => {
    if (!caseData) return;
    setLoading(true);
    if (actionItem) setActiveAction(actionItem);

    const result = await generateCallScript(caseData.id, actionItem);
    
    setScript(result);
    if (actionItem) setScriptSourceAction(actionItem);
    
    setLoading(false);
    setActiveAction(null);
  }

  const handleMarkDone = async () => {
    if (!caseData || !scriptSourceAction) return;
    
    setLocalCompleted(prev => [...prev, scriptSourceAction]);
    
    const newLog: LogEntry = {
        id: `temp-${Date.now()}`,
        date: new Date().toISOString(), 
        actor: 'Agent',
        action: `Completed action: "${scriptSourceAction}"`
    };

    setLocalHistory(prev => [newLog, ...prev]);

    setScript(null);
    setScriptSourceAction(null);

    await completeActionStep(caseData.id, scriptSourceAction);
    
    router.refresh();
  };

  const hasContext = caseData.clientContext && (
    caseData.clientContext.risks?.length || 
    caseData.clientContext.goals?.length || 
    caseData.clientContext.netWorth
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) setScript(null);
      onClose();
    }}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !max-w-[96vw] w-[96vw] h-[96vh] flex flex-col overflow-hidden font-sans p-0 gap-0 outline-none bg-slate-50 shadow-2xl rounded-lg border-0">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-50 focus:outline-none"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-4 border-b border-slate-200 bg-white shrink-0 pr-16 shadow-sm z-20">
            <DialogHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl uppercase tracking-tight font-bold text-slate-900">
                            {caseData.clientName}
                        </DialogTitle>
                        <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-slate-50 border-slate-200 text-slate-600">
                            {caseData.policyNumber}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <DialogDescription className="text-slate-500 m-0 flex items-center gap-2">
                        Provider: <span className="font-semibold text-slate-700">{caseData.providerName}</span>
                    </DialogDescription>
                    
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">Next Review:</span>
                        <span className="text-xs font-bold text-slate-800">
                            {caseData.nextActionDate || "Not Scheduled"}
                        </span>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          
          <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col z-10">
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Activity Timeline
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {visibleHistory.map((log) => (
                    <TimelineItem key={log.id} log={log}/>
                ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            
            {hasContext && (
              <div className="h-64 shrink-0 p-4 border-b border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2 shrink-0">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Client Intelligence
                </h3>
                
                <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
                  <div className="bg-red-50/40 p-3 rounded-lg border border-red-100/50 flex flex-col min-h-0">
                    <p className="text-[10px] font-bold text-red-600 mb-2 flex items-center gap-1.5 uppercase tracking-wide shrink-0">
                      <AlertTriangle className="w-3 h-3" /> Identified Risks
                    </p>
                    <div className="overflow-y-auto custom-scrollbar pr-1">
                      <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                        {caseData.clientContext?.risks?.map((risk, i) => (
                          <li key={i} className="leading-snug">{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col min-h-0">
                    <p className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide shrink-0">
                      <Target className="w-3 h-3" /> Goals
                    </p>
                    <div className="overflow-y-auto custom-scrollbar pr-1">
                      <ul className="text-xs text-slate-700 space-y-1.5">
                        {caseData.clientContext?.goals?.map((g, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="text-slate-300 shrink-0">•</span> 
                            <span className="leading-snug">{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col min-h-0">
                    <p className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide shrink-0">
                      <Wallet className="w-3 h-3" /> Financial Summary
                    </p>
                    <div className="overflow-y-auto custom-scrollbar pr-1 space-y-3">
                       <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Net Worth</p>
                          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                            {caseData.clientContext?.netWorth}
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0 p-4 flex gap-4 overflow-hidden bg-white">
               
               <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-slate-50/30">
                  <div className="px-4 py-2 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Agent Generated Script
                    </h3>
                    <div className="flex gap-2">
                        {script && (
                            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => navigator.clipboard.writeText(script)}>
                            <Copy className="w-3 h-3 mr-1.5" />
                            Copy
                            </Button>
                        )}
                        {script && scriptSourceAction && (
                            <Button 
                              size="sm" 
                              className="h-6 text-[10px] bg-green-600 hover:bg-green-700 text-white border-none shadow-sm"
                              onClick={handleMarkDone}
                            >
                            <Check className="w-3 h-3 mr-1.5" />
                            Mark Action as Done
                            </Button>
                        )}
                    </div>
                  </div>
                  
                  {script ? (
                    <div className="flex-1 min-h-0 p-6 text-sm whitespace-pre-wrap font-sans text-slate-700 leading-relaxed overflow-y-auto custom-scrollbar bg-white">
                      {script}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                        <Bot className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="text-sm text-slate-900 mb-1 font-medium">
                        AI Script Generator
                      </p>
                      <p className="text-xs text-slate-500 mb-0 max-w-xs leading-relaxed">
                        Select an action from the list on the right to generate a tailored script.
                      </p>
                    </div>
                  )}
               </div>

               <div className="w-72 shrink-0 flex flex-col rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="px-4 py-2 border-b border-slate-200 bg-white shrink-0 flex items-center gap-2">
                    <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Upcoming Actions
                    </h3>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-slate-50/30">
                     <div className="space-y-2">
                        {caseData.clientContext?.nextSteps && caseData.clientContext.nextSteps.length > 0 ? (
                           caseData.clientContext.nextSteps.map((step, i) => {
                              const isCompleted = localCompleted.includes(step);

                              return (
                              <button
                                key={i}
                                onClick={() => !isCompleted && handleGenerateScript(step)}
                                disabled={loading || isCompleted}
                                className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 group relative
                                   ${isCompleted 
                                     ? "bg-green-50/50 border-green-100 opacity-70 cursor-not-allowed" 
                                     : activeAction === step 
                                        ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200" 
                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                                   }
                                `}
                              >
                                 <div className="flex items-start gap-2.5">
                                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 
                                       ${isCompleted 
                                          ? "bg-green-100 text-green-600" 
                                          : activeAction === step 
                                            ? "bg-indigo-100 text-indigo-600" 
                                            : "bg-slate-100 text-slate-400 group-hover:text-indigo-500"}
                                    `}>
                                       {activeAction === step ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : isCompleted ? <Check className="w-2.5 h-2.5"/> : <CheckCircle2 className="w-3 h-3" />}
                                    </div>
                                    <div>
                                       <p className={`text-xs font-medium leading-snug 
                                          ${isCompleted ? "text-green-800 line-through decoration-green-300" : activeAction === step ? "text-indigo-900" : "text-slate-700 group-hover:text-slate-900"}
                                       `}>
                                          {step}
                                       </p>
                                    </div>
                                 </div>
                              </button>
                           )})
                        ) : (
                           <div className="text-center p-4 text-slate-400 text-xs">
                              No specific next steps found.
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-3 w-full text-xs h-7"
                                onClick={() => handleGenerateScript()}
                              >
                                Standard Chase
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

function TimelineItem({ log }: { log: LogEntry }) {
  const isAgent = log.actor === 'Agent';

  return (
    <div className="flex gap-3 group">
      <div className="w-6 flex flex-col items-center shrink-0">
        <div className={`p-1.5 rounded-full ${isAgent ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-50' : 'bg-slate-100 text-slate-500'}`}>
          {getIcon(log.actor)}
        </div>
        <div className="w-0.5 grow bg-slate-200 mt-1 group-last:hidden min-h-4" />
      </div>

      <div className="pb-2 w-full">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold ${isAgent ? 'text-indigo-700' : 'text-slate-900'}`}>
            {log.actor}
          </span>
          <span className="text-[10px] text-slate-400">
            {/* CHANGED: Use real time distance */}
            {formatDistanceToNow(new Date(log.date), { addSuffix: true })}
          </span>
        </div>

        <div className={`text-xs leading-relaxed ${isAgent ? 'text-indigo-900 bg-indigo-50/50 p-2.5 rounded border border-indigo-100' : 'text-slate-600'}`}>
          {log.action}
        </div>
      </div>
    </div>
  );
}

function getIcon(actor: string) {
  switch (actor) {
    case 'Agent': return <Bot className="w-3.5 h-3.5" />
    case 'Client': return <User className="w-3.5 h-3.5" />
    case 'Provider': return <Building2 className="w-3.5 h-3.5" />
    default: return <FileText className="w-3.5 h-3.5" />
  }
}