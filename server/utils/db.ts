import mysql from 'mysql2/promise';

// Use globalThis to persist the connection pool across hot reloads in development
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

export const useDb = () => {
  if (!globalForDb.pool) {
    console.log('Initializing new database connection pool...');
    globalForDb.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
      ssl: {
        rejectUnauthorized: false
      },
      waitForConnections: true,
      connectionLimit: 5, // Reduced to be safer for Aiven hobby plans
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });
  }
  return globalForDb.pool;
};
