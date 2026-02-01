'use server'

import { getDb, saveDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { revalidatePath } from 'next/cache';

export async function resetSimulation() {
  seedDatabase();
  revalidatePath('/'); 
}

export async function getDashboardData() {
  return getDb();
}