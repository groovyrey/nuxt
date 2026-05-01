import { requireAuth } from '../../utils/auth';
import { useDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();

  const [rows] = await db.execute(
    'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20',
    [session.username]
  );

  return rows;
});
