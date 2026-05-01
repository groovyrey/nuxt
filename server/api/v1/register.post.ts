import { useDb } from '../../utils/db';
import { hashPassword } from '../../utils/auth';
import { validateApiKey } from '../../utils/api-key';

export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'X-API-Key');
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'API Key required' });
  }

  const devUserId = await validateApiKey(apiKey);
  if (!devUserId) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API Key' });
  }

  const body = await readBody(event);
  const { email, faceDescriptor } = body;

  // Validation
  if (!email || !faceDescriptor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and faceDescriptor are required',
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' });
  }

  const db = useDb();
  
  try {
    const descriptorToStore = JSON.stringify(faceDescriptor);
    
    // Use ON DUPLICATE KEY UPDATE to allow re-registering faces for the same email
    await db.execute(
      'INSERT INTO external_users (developer_id, email, face_descriptor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE face_descriptor = ?',
      [devUserId, email, descriptorToStore, descriptorToStore]
    );

    return { 
      success: true, 
      email,
      message: 'Face registered successfully'
    };
  } catch (error: any) {
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
