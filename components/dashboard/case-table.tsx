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
import { formatDistanceToNow } from "date-fns"

export function CaseTable({ cases }: { cases: Case[] }) {
  return (
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
              <TableHead>Urgency</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-slate-50">
                <TableCell className="font-medium">{c.clientName}</TableCell>
                <TableCell>{c.providerName}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell>
                  <UrgencyBadge level={c.urgency} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(c.lastUpdateDate))} ago
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800 hover:bg-green-100',
    'loa-sent-client': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    'loa-sent-provider': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    'processing-loa': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  };
  
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <Badge className={styles[status] || 'bg-slate-100 text-slate-800'}>
      {label}
    </Badge>
  )
}

function UrgencyBadge({ level }: { level: string }) {
  if (level === 'critical') return <Badge variant="destructive">Critical</Badge>
  if (level === 'high') return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>
  return <Badge variant="outline">Normal</Badge>
}