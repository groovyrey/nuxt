import { requireAuth } from '../../utils/auth';
import { useDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { threshold } = body;

  if (threshold === undefined || isNaN(parseFloat(threshold))) {
    throw createError({ statusCode: 400, statusMessage: 'Valid threshold is required' });
  }

  const db = useDb();

  await db.execute(
    'UPDATE api_keys SET threshold = ? WHERE id = ? AND user_id = ?',
    [parseFloat(threshold), id, session.username]
  );

  return { success: true };
});
