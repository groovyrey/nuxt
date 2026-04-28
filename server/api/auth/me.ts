import { getSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'auth_session');
  
  if (!sessionId) {
    return { user: null };
  }

  const session = await getSession(sessionId);
  if (!session) {
    deleteCookie(event, 'auth_session');
    return { user: null };
  }

  return {
    user: {
      username: session.username,
      email: session.email,
      gender: session.gender,
      age: session.age
    }
  };
});
