import { useDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const db = useDb();
  
  const [result] = await db.execute(
    'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
    [id, session.username]
  );
  
  const deleteResult = result as any;
  if (deleteResult.affectedRows === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'API Key not found or unauthorized'
    });
  }
  
  return { success: true };
});
