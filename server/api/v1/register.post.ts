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
  const { username, email, password, gender, age, faceDescriptor } = body;

  // Validation (simplified version of the main register logic)
  if (!username || !email || !password || !faceDescriptor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username, email, password, and faceDescriptor are required',
    });
  }

  const usernameRegex = /^[a-zA-Z](?:[a-zA-Z0-9._](?![._])){1,18}[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid username format' });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' });
  }

  const db = useDb();
  
  try {
    const hashed = await hashPassword(password);
    const descriptorToStore = JSON.stringify(faceDescriptor);
    
    await db.execute(
      'INSERT INTO users (username, email, password, gender, age, face_descriptor) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashed, gender || null, age || null, descriptorToStore]
    );

    return { 
      success: true, 
      username,
      message: 'User registered via Luface API'
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
