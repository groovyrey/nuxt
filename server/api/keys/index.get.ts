import { useDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const db = useDb();
  
  const [rows] = await db.execute(
    'SELECT id, name, key_prefix, ROUND(threshold, 2) as threshold, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
    [session.username]
  );
  
  return rows;
});
