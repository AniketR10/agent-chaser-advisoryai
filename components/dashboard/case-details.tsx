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
import { formatDistance } from "date-fns"
import { Bot, User, Building2, FileText, PhoneCall, Sparkles, Copy, UploadCloud, Loader2 } from "lucide-react"
import { useState } from "react"
import { generateCallScript, uploadProviderDocument } from "@/app/actions"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CaseDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  caseData: Case | null
  virtualDate: string
}

export function CaseDetailsDialog({ isOpen, onClose, caseData, virtualDate }: CaseDetailsDialogProps) {
  const [script, setScript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.[0] || !caseData) return;

  setUploading(true);
  const formData = new FormData();
  formData.append('caseId', caseData.id);
  formData.append('file', e.target.files[0]);

  const result = await uploadProviderDocument(formData);

  setUploading(false);

  if (result.success && result.script) {
    setScript(result.script); // Auto-show the script the AI wrote!
  }
};

  if (!caseData && script) setScript(null)

  const handleGenerateScript = async () => {
    if (!caseData) return;
    setLoading(true);
    const result = await generateCallScript(caseData.id);
    setScript(result);
    setLoading(false);
  }

  if (!caseData) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) setScript(null);
      onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4 text-xl">
            {caseData.clientName}
            <Badge variant="outline" className="font-normal text-sm">
              {caseData.policyNumber}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Provider: <span className="font-semibold text-slate-700">{caseData.providerName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 flex-1 overflow-hidden min-h-0">
          
          <div className="overflow-y-auto pr-4 border-r h-full custom-scrollbar">
            <h3 className="text-sm font-medium text-slate-500 mb-4 sticky top-0 bg-white py-2 z-10">
              Activity Timeline
            </h3>
            <div className="space-y-4 pb-4">
               {[...caseData.history].reverse().map((log) => (
                  <TimelineItem key={log.id} log={log} virtualDate={virtualDate} />
               ))}
               
               <div className="flex gap-4 opacity-50 px-1">
                 <div className="w-8 flex flex-col items-center">
                   <div className="w-2 h-2 rounded-full bg-slate-300 mt-2" />
                 </div>
                 <div>
                   <p className="text-sm text-slate-500">Case Created</p>
                   <p className="text-xs text-slate-400">
                     {formatDistance(new Date(caseData.dateCreated), new Date(virtualDate))} ago
                   </p>
                 </div>
               </div>
            </div>
          </div>

            <div className="flex flex-col h-full pb-4 overflow-hidden">
            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 mb-4">
                <Label htmlFor="doc-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                    {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                    <UploadCloud className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                    {uploading ? "Analyzing with Groq..." : "Upload Provider Response"}
                    </span>
                </div>
                <Input 
                    id="doc-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                </Label>
            </div>

            <h3 className="text-sm font-medium text-slate-500 mb-4 sticky top-0 bg-white py-2 z-10 shrink-0">
                Agent Analysis & Scripts
            </h3>
            
            {script ? (
              <div className="flex-1 min-h-0 bg-slate-50 p-4 rounded-lg border text-sm whitespace-pre-wrap font-mono overflow-y-auto shadow-inner text-slate-800 custom-scrollbar">
                {script}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm text-slate-700 mb-1 font-medium">
                  {caseData.urgency === 'high' ? 'High Urgency Detected' : 'Routine Check Recommended'}
                </p>
                <p className="text-xs text-slate-500 mb-6 max-w-62.5">
                  The Agent can analyze the timeline and generate a strict call script for {caseData.providerName}.
                </p>
                <Button onClick={handleGenerateScript} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <PhoneCall className="w-4 h-4 mr-2" />}
                  Generate Call Script
                </Button>
              </div>
            )}
            
            {script && (
              <Button variant="outline" className="mt-4 shrink-0" onClick={() => navigator.clipboard.writeText(script)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

function TimelineItem({ log, virtualDate }: { log: LogEntry, virtualDate: string }) {
  const isAgent = log.actor === 'Agent';
  
  return (
    <div className="flex gap-4 group">
      <div className="w-8 flex flex-col items-center shrink-0">
        <div className={`p-2 rounded-full ${isAgent ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-50' : 'bg-slate-100 text-slate-500'}`}>
          {getIcon(log.actor)}
        </div>
        <div className="w-0.5 grow bg-slate-200 mt-2 group-last:hidden min-h-5" />
      </div>

      <div className="pb-2 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${isAgent ? 'text-indigo-700' : 'text-slate-900'}`}>
            {log.actor}
          </span>
          <span className="text-xs text-slate-400">
            {formatDistance(new Date(log.date), new Date(virtualDate))} ago
          </span>
        </div>
        <div className={`text-sm leading-relaxed ${isAgent ? 'text-indigo-900 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100' : 'text-slate-600'}`}>
          {log.action}
        </div>
      </div>
    </div>
  )
}

function getIcon(actor: string) {
  switch (actor) {
    case 'Agent': return <Bot className="w-4 h-4" />
    case 'Client': return <User className="w-4 h-4" />
    case 'Provider': return <Building2 className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}