import { useDb } from '../../utils/db';
import { createSession, findMatchingUserByFace } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { faceDescriptor } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or missing face descriptor',
      });
    }

    const matchedUser = await findMatchingUserByFace(faceDescriptor);

    if (!matchedUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Face not recognized',
      });
    }

    const sessionId = await createSession(matchedUser.username);
    
    setCookie(event, 'auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.DB_HOST?.includes('localhost'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return { success: true, username: matchedUser.username };
  } catch (error: any) {
    console.error('Face Login Server Error:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during face authentication',
    });
  }
});
