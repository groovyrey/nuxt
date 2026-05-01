import { requireAuth } from '../../utils/auth';
import { useDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const db = useDb();

  await db.execute(
    'DELETE FROM webhooks WHERE id = ? AND user_id = ?',
    [id, session.username]
  );

  return { success: true };
});
