import { validateApiKey } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';
import { logApiUsage } from '../../utils/usage';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { apiKey, faceDescriptor, email } = body;
  const url = getRequestURL(event);

  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'API Key required' });
  }

  const keyRecord = await validateApiKey(apiKey);
  if (!keyRecord) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API Key' });
  }

  if (!faceDescriptor || !email) {
    await logApiUsage(keyRecord.id, url.pathname, 400);
    throw createError({ statusCode: 400, statusMessage: 'Face data and email are required' });
  }

  const matchedUser = await findMatchingUserByFace(
    faceDescriptor, 
    email, 
    keyRecord.user_id,
    keyRecord.threshold
  );

  if (!matchedUser) {
    await logApiUsage(keyRecord.id, url.pathname, 200);
    return {
      success: false,
      message: 'Biometric verification failed'
    };
  }

  await logApiUsage(keyRecord.id, url.pathname, 200);

  return {
    success: true,
    username: matchedUser.username,
    timestamp: new Date().toISOString()
  };
});
