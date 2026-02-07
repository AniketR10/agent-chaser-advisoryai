import { neon } from '@neondatabase/serverless';
import { Case, DbSchema } from './types';

const sql = neon(process.env.DATABASE_URL!);

const INITIAL_DB: DbSchema = {
  virtualDate: new Date().toISOString(),
  cases: []
};

export async function getDb(): Promise<DbSchema> {
  try {
    const result = await sql`SELECT data FROM app_storage WHERE id = TRUE`;
    
    if (result.length > 0 && result[0].data) {
      return result[0].data as DbSchema;
    }
    
    return INITIAL_DB;
  } catch (error) {
    console.error("Database Read Error:", error);
    return INITIAL_DB;
  }
}

export async function saveDb(data: DbSchema): Promise<void> {
  try {
    await sql`
      INSERT INTO app_storage (id, data)
      VALUES (TRUE, ${JSON.stringify(data)})
      ON CONFLICT (id) 
      DO UPDATE SET data = ${JSON.stringify(data)}
    `;
  } catch (error) {
    console.error("Database Write Error:", error);
    throw new Error("Failed to save to database");
  }
}

export async function updateCase(updatedCase: Case) {
  const db = await getDb();
  const index = db.cases.findIndex((c) => c.id === updatedCase.id);
  
  if (index !== -1) {
    db.cases[index] = updatedCase;
    await saveDb(db); 
  } else {
    console.warn(`Case ${updatedCase.id} not found for update`);
  }
}