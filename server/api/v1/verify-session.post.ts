import { validateApiKey } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { apiKey, faceDescriptor } = body;

  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'API Key required' });
  }

  const devUserId = await validateApiKey(apiKey);
  if (!devUserId) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API Key' });
  }

  if (!faceDescriptor) {
    throw createError({ statusCode: 400, statusMessage: 'Face data missing' });
  }

  const matchedUser = await findMatchingUserByFace(faceDescriptor);

  if (!matchedUser) {
    return {
      success: false,
      message: 'No match found'
    };
  }

  // In a production app, we'd sign this result with a JWT or secret 
  // so the developer can verify it hasn't been tampered with.
  return {
    success: true,
    username: matchedUser.username,
    timestamp: new Date().toISOString()
  };
});
