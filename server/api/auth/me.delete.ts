import { useDb } from '../../utils/db';
import { getAuthSession, deleteSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'auth_session');

  if (!sessionId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const session = await getAuthSession(sessionId);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Session expired' });
  }

  const db = useDb();

  try {
    // 1. Delete the user (Cascade will handle sessions in most DBs, but we'll be safe)
    await db.execute('DELETE FROM users WHERE username = ?', [session.username]);
    
    // 2. Clear the cookie
    deleteCookie(event, 'auth_session');

    return { success: true };
  } catch (error) {
    console.error('Account deletion error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account'
    });
  }
});