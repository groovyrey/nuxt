import { validateApiKey, updateExternalUserActivity } from '../../utils/api-key';
import { findMatchingUserByFace } from '../../utils/auth';
import crypto from 'crypto';

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

  let responseData: any = {
    success: false,
    timestamp: new Date().toISOString()
  };

  if (matchedUser) {
    // If an email was provided, ensure it matches the recognized face
    if (email && matchedUser.username !== email) {
      responseData = {
        success: false,
        message: 'Face does not match the provided email',
        timestamp: new Date().toISOString()
      };
    } else {
      responseData = {
        success: true,
        email: matchedUser.username,
        timestamp: new Date().toISOString()
      };
      // Update activity
      await updateExternalUserActivity(devUserId, matchedUser.username);
    }
  } else {
    responseData = {
      success: false,
      message: 'No match found',
      timestamp: new Date().toISOString()
    };
  }

  // Create HMAC signature using API Key as secret
  // Integrators can use their API Key to verify this signature
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(JSON.stringify(responseData))
    .digest('hex');

  return {
    ...responseData,
    signature
  };
});
