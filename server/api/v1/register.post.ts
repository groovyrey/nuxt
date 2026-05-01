import { useDb } from '../../utils/db';
import { hashPassword } from '../../utils/auth';
import { validateApiKey } from '../../utils/api-key';
import { encryptBiometrics } from '../../utils/encryption';
import { logApiUsage } from '../../utils/usage';
import { triggerWebhook } from '../../utils/webhooks';

export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'X-API-Key');
  const url = getRequestURL(event);

  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'API Key required' });
  }

  const keyRecord = await validateApiKey(apiKey);
  if (!keyRecord) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API Key' });
  }

  const devUserId = keyRecord.user_id;
  const body = await readBody(event);
  const { email, faceDescriptor } = body;

  // Validation
  if (!email || !faceDescriptor) {
    await logApiUsage(keyRecord.id, url.pathname, 400);
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and faceDescriptor are required',
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    await logApiUsage(keyRecord.id, url.pathname, 400);
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' });
  }

  const db = useDb();
  
  try {
    let descriptorToStore = JSON.stringify(faceDescriptor);
    descriptorToStore = encryptBiometrics(descriptorToStore);
    
    // Use ON DUPLICATE KEY UPDATE to allow re-registering faces for the same email
    await db.execute(
      'INSERT INTO external_users (developer_id, email, face_descriptor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE face_descriptor = ?',
      [devUserId, email, descriptorToStore, descriptorToStore]
    );

    await logApiUsage(keyRecord.id, url.pathname, 200);

    // Trigger Webhook
    await triggerWebhook(devUserId, 'user.registered', {
      email,
      timestamp: new Date().toISOString()
    });

    return { 
      success: true, 
      email,
      message: 'Face registered successfully'
    };
  } catch (error: any) {
    await logApiUsage(keyRecord.id, url.pathname, error.statusCode || 500);
    if (error.code === 'ER_DUP_ENTRY') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username or email already exists',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error',
    });
  }
});
