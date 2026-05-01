import { useDb } from '../../utils/db';
import { hashPassword, createSession, findMatchingUserByFace, parseDescriptor } from '../../utils/auth';
import { useHuggingFace } from '../../utils/huggingface';
import { encryptBiometrics } from '../../utils/encryption';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password, gender, age, faceDescriptor, faceImage } = body;

  // 1. Basic Presence Validation
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username, email, and password are required',
    });
  }

  // 2. Username Validation
  // - 3 to 20 characters
  // - Starts with a letter
  // - Can contain alphanumeric characters, underscores, and dots
  // - Cannot have consecutive dots or underscores
  // - Cannot end with a dot or underscore
  const usernameRegex = /^[a-zA-Z](?:[a-zA-Z0-9._](?![._])){1,18}[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username must be 3-20 characters, start with a letter, and contain only letters, numbers, dots, or underscores (no consecutive or trailing symbols).',
    });
  }

  // 3. Email Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid email address.',
    });
  }

  // 4. Password Strength
  // - Min 8 characters
  // - At least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters and include both letters and numbers.',
    });
  }

  // 5. Age Validation
  const numericAge = (age === null || age === '') ? null : Number(age);
  if (numericAge !== null && (isNaN(numericAge) || numericAge < 13 || numericAge > 120)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Age must be a number between 13 and 120',
    });
  }

  // 6. Gender Validation
  const validGenders = ['male', 'female', 'other'];
  if (gender && !validGenders.includes(gender)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid gender selection',
    });
  }

  const db = useDb();
  
  console.log(`Registration attempt for user: ${username}, hasFace: ${!!faceDescriptor}`);
  
  try {
    const hashed = await hashPassword(password);
    
    let descriptorToStore = faceDescriptor ? JSON.stringify(faceDescriptor) : null;
    if (descriptorToStore) {
      descriptorToStore = encryptBiometrics(descriptorToStore);
    }
    
    try {
      await db.execute(
        'INSERT INTO users (username, email, password, gender, age, face_descriptor) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashed, gender, age, descriptorToStore]
      );
    } catch (dbError: any) {
      console.error('Database insertion error:', dbError);
      throw dbError; // Rethrow to be caught by the outer catch
    }

    console.log(`User ${username} registered successfully`);

    await createSession(event, username);

    return { success: true, username };
  } catch (error: any) {
    if (error.statusCode) throw error;

    if (error.code === 'ER_DUP_ENTRY') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username or email already exists',
      });
    }
    
    console.error('Registration error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Internal server error: ${error.message || 'Unknown error'}`,
    });
  }
});
