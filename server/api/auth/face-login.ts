import { useDb } from '../../utils/db';
import { createSession, findMatchingUserByFace, EUCLIDEAN_THRESHOLD, parseDescriptor, compareManyToMany } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { faceDescriptor, faceImage, username: targetUsername } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or missing biometric signature',
      });
    }

    let finalUsername = '';

    if (targetUsername) {
      const db = useDb();
      const [rows] = await db.execute(
        'SELECT username, face_descriptor FROM users WHERE username = ? AND face_descriptor IS NOT NULL',
        [targetUsername]
      );
      const users = rows as any[];
      
      if (users.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Biometric profile not found' });
      }

      const user = users[0];
      const storedDescriptors = parseDescriptor(user.face_descriptor);
      
      const inputDescriptors = Array.isArray(faceDescriptor[0]) 
        ? (faceDescriptor as number[][]) 
        : [faceDescriptor as number[]];

      const distance = storedDescriptors ? compareManyToMany(inputDescriptors, storedDescriptors) : Infinity;

      if (distance >= EUCLIDEAN_THRESHOLD) {
        throw createError({ statusCode: 401, statusMessage: 'Biometric verification failed' });
      }
      finalUsername = user.username;
    } else {
      // Standard Mode: Find any matching user
      console.log('Discovery mode: searching database for biometric match...');
      const matchedUser = await findMatchingUserByFace(faceDescriptor);
      
      if (matchedUser) {
        finalUsername = matchedUser.username;
      }

      if (!finalUsername) {
        throw createError({ statusCode: 401, statusMessage: 'Biometric signature not recognized. Please ensure your face is clearly visible.' });
      }
    }

    const sessionId = await createSession(finalUsername);
    
    setCookie(event, 'auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.DB_HOST?.includes('localhost'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return { success: true, username: finalUsername };
  } catch (error: any) {
    console.error('FACE_LOGIN_CRITICAL_ERROR:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      data: error.data
    });
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Luface engine error during authentication',
    });
  }
});
