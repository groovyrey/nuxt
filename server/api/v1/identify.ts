import { validateApiKey } from '../../utils/api-key';
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
  const { faceDescriptor } = body;

  if (!faceDescriptor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'faceDescriptor is required'
    });
  }

  const matchedUser = await findMatchingUserByFace(faceDescriptor);

  if (!matchedUser) {
    return {
      match: false,
      username: null
    };
  }

  return {
    match: true,
    username: matchedUser.username,
    // We can expose other non-sensitive info if needed
  };
});
