import { useDb } from '../../utils/db';
import { createSession, findMatchingUserByFace, euclideanDistance, EUCLIDEAN_THRESHOLD, parseDescriptor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { faceDescriptor, username: targetUsername } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or missing biometric signature',
      });
    }

    let finalUsername = '';

    if (targetUsername) {
      // 2FA Mode: Verify specific user
      const db = useDb();
      const [rows] = await db.execute(
        'SELECT username, face_descriptor FROM users WHERE username = ? AND face_descriptor IS NOT NULL',
        [targetUsername]
      );
      const users = rows as any[];
      
      if (users.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Biometric profile not found for this user',
        });
      }

      const user = users[0];
      const storedDescriptor = parseDescriptor(user.face_descriptor);

      if (!storedDescriptor) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Stored biometric profile is corrupted',
        });
      }

      const distance = euclideanDistance(faceDescriptor, storedDescriptor);
      console.log(`Face Login [2FA]: User=${targetUsername}, Distance=${distance.toFixed(4)}, Threshold=${EUCLIDEAN_THRESHOLD}`);

      if (distance >= EUCLIDEAN_THRESHOLD) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Biometric verification failed: identity mismatch',
        });
      }
      finalUsername = user.username;
    } else {
      // Standard Mode: Find any matching user
      const matchedUser = await findMatchingUserByFace(faceDescriptor);

      if (!matchedUser) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Biometric signature not recognized',
        });
      }
      finalUsername = matchedUser.username;
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
      statusMessage: 'Neural engine error during authentication',
    });
  }
});
