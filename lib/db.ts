import fs from 'fs';
import path from 'path';
import { DbSchema, Case } from './types';

const DB_PATH = path.join(process.cwd(), 'lib/mock-db.json');

const INITIAL_DB: DbSchema = {
  virtualDate: new Date().toISOString(),
  cases: []
};

export function getDb(): DbSchema {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return INITIAL_DB;
  }
}

export function saveDb(data: DbSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function updateCase(updatedCase: Case) {
  const db = getDb();
  const index = db.cases.findIndex((c) => c.id === updatedCase.id);
  
  if (index !== -1) {
    db.cases[index] = updatedCase;
    saveDb(db);
  }
}