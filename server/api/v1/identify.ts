import { validateApiKey, updateExternalUserActivity } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'X-API-Key');
  
  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'API Key is missing. Provide X-API-Key header.'
    });
  }

  const userId = await validateApiKey(apiKey);
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid API Key'
    });
  }

  const body = await readBody(event);
  const { faceDescriptor, email } = body;

  if (!faceDescriptor || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'faceDescriptor and email are required'
    });
  }

  const matchedUser = await findMatchingUserByFace(faceDescriptor, email, userId);

  if (!matchedUser) {
    return {
      match: false,
      username: null
    };
  }

  await updateExternalUserActivity(userId, matchedUser.username);

  return {
    match: true,
    username: matchedUser.username,
  };
});
