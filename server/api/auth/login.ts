import { useDb } from '../../utils/db';
import { comparePassword, createSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    });
  }

  const db = useDb();
  
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  
  const users = rows as any[];
  if (users.length === 0) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password',
    });
  }

  const user = users[0];
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password',
    });
  }

  const sessionId = await createSession(username);
  
    setCookie(event, 'auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.DB_HOST?.includes('localhost'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

  return { success: true, username };
});
