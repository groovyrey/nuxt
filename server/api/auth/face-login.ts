import { useDb } from '../../utils/db';
import { createSession, findMatchingUserByFace, euclideanDistance, EUCLIDEAN_THRESHOLD } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { faceDescriptor, username: targetUsername } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or missing face descriptor',
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
          statusMessage: 'User biometric profile not found',
        });
      }

      const user = users[0];
      let storedDescriptor;
      if (typeof user.face_descriptor === 'string') {
        storedDescriptor = JSON.parse(user.face_descriptor);
      } else {
        storedDescriptor = user.face_descriptor;
      }

      const distance = euclideanDistance(faceDescriptor, storedDescriptor);

      if (distance >= EUCLIDEAN_THRESHOLD) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Biometric verification failed',
        });
      }
      finalUsername = user.username;
    } else {
      // Standard Mode: Find any matching user
      const matchedUser = await findMatchingUserByFace(faceDescriptor);

      if (!matchedUser) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Face not recognized',
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
    console.error('Face Login Server Error:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during face authentication',
    });
  }
});
