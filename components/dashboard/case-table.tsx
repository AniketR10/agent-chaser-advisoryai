'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Case } from "@/lib/types"
import { formatDistance } from "date-fns"
import { CaseDetailsDialog } from "./case-details"

export function CaseTable({ cases, virtualDate }: { cases: Case[], virtualDate: string }) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

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
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow 
                  key={c.id} 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedCase(c)}
                >
                  <TableCell className="font-medium">{c.clientName}</TableCell>
                  <TableCell>{c.providerName}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistance(new Date(c.lastUpdateDate), new Date(virtualDate))} ago
                  </TableCell>
                </TableRow>
              ))}
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800 hover:bg-green-100',
    'loa-sent-client': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    'loa-sent-provider': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    'processing-loa': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    'discovery': 'bg-slate-100 text-slate-800 hover:bg-slate-100',
    'provider-ack': 'bg-teal-100 text-teal-800 hover:bg-teal-100',
  };
  
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <Badge className={styles[status] || 'bg-slate-100 text-slate-800'}>
      {label}
    </Badge>
  )
}
