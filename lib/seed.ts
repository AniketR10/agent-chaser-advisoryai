import { Case, LogEntry } from './types';
import { saveDb } from './db';
import { subDays } from 'date-fns';

export function seedDatabase() {
  const now = new Date();
  
  const cases: Case[] = [
    {
      id: 'case-1',
      clientName: 'Sarah Jenkins',
      providerName: 'Alina',
      policyNumber: 'AV-9982-X',
      status: 'loa-sent-client',
      dateCreated: subDays(now, 10).toISOString(),
      lastUpdateDate: subDays(now, 8).toISOString(),
      nextActionDate: subDays(now, 1).toISOString(),
      history: [
        { id: '1', date: subDays(now, 10).toISOString(), actor: 'Advisor', action: 'Case Created' },
        { id: '2', date: subDays(now, 8).toISOString(), actor: 'Advisor', action: 'LOA Sent to Client' }
      ]
    },
    {
      id: 'case-2',
      clientName: 'Marcus Chen',
      providerName: 'Legal & General',
      policyNumber: 'LG-2231-P',
      status: 'loa-sent-provider',
      dateCreated: subDays(now, 20).toISOString(),
      lastUpdateDate: subDays(now, 18).toISOString(),
      nextActionDate: subDays(now, 3).toISOString(),
      history: [
        { id: '1', date: subDays(now, 20).toISOString(), actor: 'Advisor', action: 'LOA Signed by Client' },
        { id: '2', date: subDays(now, 18).toISOString(), actor: 'Advisor', action: 'LOA Sent to Provider' }
      ]
    },
    {
      id: 'case-3',
      clientName: 'Emily Blunt',
      providerName: 'Royal London',
      policyNumber: 'RL-777-X',
      status: 'discovery',
      dateCreated: subDays(now, 2).toISOString(),
      lastUpdateDate: subDays(now, 2).toISOString(),
      nextActionDate: subDays(now, 5).toISOString(),
      history: [
        { id: '1', date: subDays(now, 2).toISOString(), actor: 'Advisor', action: 'Discovery Meeting Notes Added' }
      ]
    }
  ];

  saveDb({
    virtualDate: now.toISOString(),
    cases
  });
  
  console.log("Database seeded successfully!");
}