import { getDashboardData, resetSimulation } from './actions';
import { CaseTable } from '@/components/dashboard/case-table';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default async function Home() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agentic Chaser</h1>
          <p className="text-slate-500">AdvisoryAI Hackathon Challenge</p>
        </div>
        
        <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-right mr-4 border-r pr-4">
            <p className="text-xs text-slate-400 font-bold uppercase">Virtual Date</p>
            <p className="font-mono text-lg">
              {new Date(data.virtualDate).toDateString()}
            </p>
          </div>
          
          <form action={resetSimulation}>
            <Button variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset Demo
            </Button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <CaseTable cases={data.cases} />
      </div>
    </main>
  );
}