import { useDb } from '../../utils/db';
import { hashPassword, createSession, findMatchingUserByFace } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password, gender, age, faceDescriptor } = body;

  // 1. Basic Presence Validation
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username, email, and password are required',
    });
  }

  // 2. Username Validation (Alphanumeric, 3-20 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username must be 3-20 alphanumeric characters or underscores',
    });
  }

  // 3. Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format',
    });
  }

  // 4. Password Strength (Min 8 chars)
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters long',
    });
  }

  // 5. Age Validation
  if (age !== null && (typeof age !== 'number' || age < 13 || age > 120)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Age must be a number between 13 and 120',
    });
  }

  // 6. Gender Validation
  const validGenders = ['male', 'female', 'other'];
  if (gender && !validGenders.includes(gender)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid gender selection',
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
