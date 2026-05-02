import { validateApiKey } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';
import { logApiUsage, logAudit } from '../../utils/usage';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);
  const { faceDescriptor } = body;
  const apiKey = body.apiKey || query.apiKey || getHeader(event, 'X-API-Key');
  const email = body.email || query.email;
  const url = getRequestURL(event);
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || null;

  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'API Key required' });
  }

  const keyRecord = await validateApiKey(apiKey);
  if (!keyRecord) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API Key' });
  }

  const devUserId = keyRecord.user_id;

  if (!faceDescriptor || !email) {
    await logApiUsage(keyRecord.id, url.pathname, 400);
    throw createError({ statusCode: 400, statusMessage: 'Face data and email are required' });
  }

  const matchedUser = await findMatchingUserByFace(
    faceDescriptor, 
    email, 
    devUserId,
    keyRecord.threshold
  );

  if (!matchedUser) {
    await logApiUsage(keyRecord.id, url.pathname, 200);
    await logAudit(devUserId, 'verify.fail', { email, apiKeyName: keyRecord.name }, typeof ip === 'string' ? ip : null);
    return {
      success: false,
      message: 'Biometric verification failed'
    };
  }

  await logApiUsage(keyRecord.id, url.pathname, 200);
  await logAudit(devUserId, 'verify.success', { email, apiKeyName: keyRecord.name }, typeof ip === 'string' ? ip : null);

  return {
    success: true,
    username: matchedUser.username,
    timestamp: new Date().toISOString()
  };
});
