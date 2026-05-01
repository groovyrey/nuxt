import { validateApiKey } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { apiKey, faceDescriptor, email } = body;

  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'API Key required' });
  }

  const devUserId = await validateApiKey(apiKey);
  if (!devUserId) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API Key' });
  }

  if (!faceDescriptor || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Face data and email are required' });
  }

  const matchedUser = await findMatchingUserByFace(faceDescriptor, email, devUserId);

  if (!matchedUser) {
    return {
      success: false,
      message: 'Biometric verification failed'
    };
  }

  return {
    success: true,
    username: matchedUser.username,
    timestamp: new Date().toISOString()
  };
});
