import { useDb } from '../../utils/db';
import { hashPassword, createSession, findMatchingUserByFace } from '../../utils/auth';

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
    // Check if face is already registered
    if (faceDescriptor && Array.isArray(faceDescriptor)) {
      const existingUser = await findMatchingUserByFace(faceDescriptor);
      if (existingUser) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This biometric profile is already registered to another account',
        });
      }
    }

    const hashed = await hashPassword(password);
    
    await db.execute(
      'INSERT INTO users (username, email, password, gender, age, face_descriptor) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashed, gender, age, faceDescriptor ? JSON.stringify(faceDescriptor) : null]
    );

    const sessionId = await createSession(username);
    
    setCookie(event, 'auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.DB_HOST?.includes('localhost'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true, username };
  } catch (error: any) {
    if (error.statusCode) throw error;

    if (error.code === 'ER_DUP_ENTRY') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username or email already exists',
      });
    }
    
    console.error('Registration error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
