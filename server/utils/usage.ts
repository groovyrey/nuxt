import { useDb } from './db';

export const logApiUsage = async (apiKeyId: string, endpoint: string, statusCode: number) => {
  const db = useDb();
  try {
    await db.execute(
      'INSERT INTO api_usage (api_key_id, endpoint, status_code) VALUES (?, ?, ?)',
      [apiKeyId, endpoint, statusCode]
    );
  } catch (e) {
    console.error('Failed to log API usage:', e);
  }
};

export const logAudit = async (userId: string, action: string, details: any = null, ipAddress: string | null = null) => {
  const db = useDb();
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [userId, action, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (e) {
    console.error('Failed to log audit event:', e);
  }
};
