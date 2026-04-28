import { useDb } from '../../utils/db';
import { hashPassword, createSession } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password, gender, age, faceDescriptor } = body;

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    });
  }

  const db = useDb();
  
  try {
    const hashed = await hashPassword(password);
    
    await db.execute(
      'INSERT INTO users (username, email, password, gender, age, face_descriptor) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashed, gender, age, faceDescriptor ? JSON.stringify(faceDescriptor) : null]
    );

    const sessionId = await createSession(username);
    
    setCookie(event, 'auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true, username };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username or email already exists',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
