import { deleteSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'auth_session');
  if (sessionId) {
    await deleteSession(sessionId);
  }
  
  deleteCookie(event, 'auth_session');
  return { success: true };
});
