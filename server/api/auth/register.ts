import { useDb } from '../../utils/db';
import { hashPassword, createSession, findMatchingUserByFace, parseDescriptor } from '../../utils/auth';

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

  // 2. Username Validation
  // - 3 to 20 characters
  // - Starts with a letter
  // - Can contain alphanumeric characters, underscores, and dots
  // - Cannot have consecutive dots or underscores
  // - Cannot end with a dot or underscore
  const usernameRegex = /^[a-zA-Z](?:[a-zA-Z0-9._](?![._])){1,18}[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username must be 3-20 characters, start with a letter, and contain only letters, numbers, dots, or underscores (no consecutive or trailing symbols).',
    });
  }

  // 3. Email Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid email address.',
    });
  }

  // 4. Password Strength
  // - Min 8 characters
  // - At least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters and include both letters and numbers.',
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
    /* 
    // Biometric uniqueness check disabled per request
    if (faceDescriptor && Array.isArray(faceDescriptor)) {
      const matchedUser = await findMatchingUserByFace(faceDescriptor);
      if (matchedUser) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This biometric profile is already registered to another account',
        });
      }
    }
    */

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
