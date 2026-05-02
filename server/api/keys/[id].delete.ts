import { useDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';
import { logAudit } from '../../utils/usage';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || null;
  const db = useDb();

  // Fetch key details before deletion for auditing
  const [rows] = await db.execute(
    'SELECT name, key_prefix FROM api_keys WHERE id = ? AND user_id = ?',
    [id, session.username]
  );
  
  const keys = rows as any[];
  if (keys.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'API Key not found or unauthorized'
    });
  }

  const key = keys[0];
  
  await db.execute(
    'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
    [id, session.username]
  );

  await logAudit(session.username, 'key.deleted', { name: key.name, prefix: key.key_prefix }, typeof ip === 'string' ? ip : null);
  
  return { success: true };
});
