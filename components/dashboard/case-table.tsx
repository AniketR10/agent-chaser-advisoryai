'use client'

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Case } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { CaseDetailsDialog } from "./case-details"
import { CheckCircle2, MinusCircle, Trash2 } from "lucide-react"
import { deleteCase } from "@/app/actions"

export function CaseTable({ cases, virtualDate }: { cases: Case[], virtualDate: string }) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  const sortedCases = [...cases].sort((a, b) => 
    new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );

  const cleanActionText = (text: string) => {
    return text
      .replace(/^RECOMMENDATIONS.*?(?:- |: )/i, '')
      .replace(/^UPCOMING ACTIONS.*?(?:- |: )/i, '')
      .replace(/^STATUS.*?(?:- |: )/i, '')
      .replace(/^[A-Z\s]{2,}(?:- |: )/g, '')
      .replace(/^[:\-\s]+/, '')
      .trim();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this case?")) {
      await deleteCase(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Cases ({cases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="w-[50%]">Latest Action</TableHead>
                <TableHead className="w-[15%] text-right pr-2">Last Update</TableHead>
                <TableHead className="w-12.5"></TableHead> 
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCases.map((c) => {
                const completedSteps = c.clientContext?.completedSteps || [];
                const rawLatestAction = completedSteps.length > 0 
                  ? completedSteps[completedSteps.length - 1] 
                  : null;

                const displayAction = rawLatestAction ? cleanActionText(rawLatestAction) : null;

                return (
                  <TableRow 
                    key={c.id} 
                    className="cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={() => setSelectedCase(c)}
                  >
                    <TableCell className="font-medium">{c.clientName}</TableCell>
                    <TableCell>{c.providerName}</TableCell>
                    <TableCell>
                      {displayAction ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-normal normal-case max-w-87.5 truncate block py-1">
                          <CheckCircle2 className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                          {displayAction}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-normal normal-case shadow-sm py-1">
                           <MinusCircle className="w-3 h-3 inline mr-1.5 -mt-0.5 opacity-50" />
                           No Activity
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="w-[15%] text-right pr-2 text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(c.lastUpdateDate), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => handleDelete(e, c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CaseDetailsDialog 
        isOpen={!!selectedCase} 
        onClose={() => setSelectedCase(null)} 
        caseData={selectedCase}
        virtualDate={virtualDate}
      />
    </>
  )
}