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

  if (!faceDescriptor) {
    throw createError({ statusCode: 400, statusMessage: 'Face data missing' });
  }

  const matchedUser = await findMatchingUserByFace(faceDescriptor, devUserId);

  if (!matchedUser) {
    return {
      success: false,
      message: 'No match found'
    };
  }

  // If an email was provided, ensure it matches the recognized face
  if (email && matchedUser.username !== email) {
    return {
      success: false,
      message: 'Face does not match the provided email'
    };
  }

  return {
    success: true,
    username: matchedUser.username,
    timestamp: new Date().toISOString()
  };
});
