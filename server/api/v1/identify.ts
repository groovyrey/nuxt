import { validateApiKey, updateExternalUserActivity } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';
import { logApiUsage } from '../../utils/usage';
import { triggerWebhook } from '../../utils/webhooks';

export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'X-API-Key');
  const url = getRequestURL(event);
  
  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'API Key is missing. Provide X-API-Key header.'
    });
  }

  const keyRecord = await validateApiKey(apiKey);
  if (!keyRecord) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid API Key'
    });
  }

  const userId = keyRecord.user_id;
  const query = getQuery(event);
  const body = await readBody(event);
  const { faceDescriptor } = body;
  const email = body.email || query.email;

  if (!faceDescriptor || !email) {
    await logApiUsage(keyRecord.id, url.pathname, 400);
    throw createError({
      statusCode: 400,
      statusMessage: 'faceDescriptor and email are required'
    });
  }

  const matchedUser = await findMatchingUserByFace(
    faceDescriptor, 
    email, 
    userId,
    keyRecord.threshold // Pass custom threshold
  );

  if (!matchedUser) {
    await logApiUsage(keyRecord.id, url.pathname, 200);
    return {
      match: false,
      username: null
    };
  }

  await updateExternalUserActivity(userId, matchedUser.username);
  await logApiUsage(keyRecord.id, url.pathname, 200);

  // Trigger Webhook
  await triggerWebhook(userId, 'face.identified', {
    username: matchedUser.username,
    email: matchedUser.email || matchedUser.username,
    timestamp: new Date().toISOString()
  });

  return {
    match: true,
    username: matchedUser.username,
  };
});
