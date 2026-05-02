import { useDb } from '../../utils/db';
import { createSession, findMatchingUserByFace, EUCLIDEAN_THRESHOLD, parseDescriptor, compareManyToMany } from '../../utils/auth';
import { logAudit } from '../../utils/usage';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { faceDescriptor, username } = body;
    const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || null;

    if (!username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username is required for biometric authentication',
      });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or missing biometric signature',
      });
    }

    const matchedUser = await findMatchingUserByFace(faceDescriptor, username);
    
    if (!matchedUser) {
      await logAudit(username, 'auth.fail', { method: 'biometric' }, typeof ip === 'string' ? ip : null);
      throw createError({ statusCode: 401, statusMessage: 'Biometric verification failed' });
    }

    await createSession(event, matchedUser.username);
    await logAudit(matchedUser.username, 'auth.success', { method: 'biometric' }, typeof ip === 'string' ? ip : null);

    return { success: true, username: matchedUser.username };
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
