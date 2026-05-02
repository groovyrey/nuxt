import { requireAuth } from '../../utils/auth';
import { useDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();

  // Aggregate usage by day for the last 7 days
  const [rows] = await db.execute(`
    SELECT 
      DATE(u.timestamp) as date, 
      COUNT(*) as count,
      k.name as key_name
    FROM api_usage u
    JOIN api_keys k ON u.api_key_id = k.id
    WHERE k.user_id = ? AND u.timestamp > datetime('now', '-7 days')
    GROUP BY DATE(u.timestamp), k.id
    ORDER BY date ASC
  `, [session.username]);

  return rows;
});
