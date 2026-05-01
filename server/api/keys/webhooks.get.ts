import { requireAuth } from '../../utils/auth';
import { useDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();

  const [rows] = await db.execute(
    'SELECT * FROM webhooks WHERE user_id = ? ORDER BY created_at DESC',
    [session.username]
  );

  return rows;
});
