import { createClient } from '@libsql/client';

// Use globalThis to persist the connection client across hot reloads in development
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

export const useDb = () => {
  if (!globalForDb.client) {
    console.log('Initializing new Turso database client...');
    globalForDb.client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  const db = {
    async execute(sql: string, params: any[] = []) {
      try {
        const result = await globalForDb.client!.execute({
          sql,
          args: params
        });

        // Map rows to match mysql2 behavior where rows are accessed as objects
        return [result.rows, null];
      } catch (e: any) {
        // Map common SQLite error codes to MySQL equivalents for compatibility
        if (e.code === 'SQLITE_CONSTRAINT' || e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          e.code = 'ER_DUP_ENTRY';
        } else if (e.message?.includes('already exists') || e.message?.includes('UNIQUE constraint failed')) {
          e.code = 'ER_DUP_ENTRY';
        }
        
        console.error('Database error:', e);
        throw e;
      }
    },
    async query(sql: string, params: any[] = []) {
      return this.execute(sql, params);
    }
  };

  return db;
};
