import { useDb } from '../../utils/db';
import { createSession } from '../../utils/auth';

const EUCLIDEAN_THRESHOLD = 0.6;

function euclideanDistance(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { faceDescriptor } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or missing face descriptor',
      });
    }

    const db = useDb();
    const [rows] = await db.execute('SELECT username, face_descriptor FROM users WHERE face_descriptor IS NOT NULL');
    const users = rows as any[];

    let matchedUser = null;
    let minDistance = Infinity;

    for (const user of users) {
      try {
        let storedDescriptor;
        // mysql2 might return JSON columns as strings or already-parsed objects
        if (typeof user.face_descriptor === 'string') {
          storedDescriptor = JSON.parse(user.face_descriptor);
        } else {
          storedDescriptor = user.face_descriptor;
        }

        if (!Array.isArray(storedDescriptor)) continue;

        const distance = euclideanDistance(faceDescriptor, storedDescriptor);
        
        if (distance < minDistance && distance < EUCLIDEAN_THRESHOLD) {
          minDistance = distance;
          matchedUser = user;
        }
      } catch (parseError) {
        console.error(`Error parsing descriptor for user ${user.username}:`, parseError);
        continue;
      }
    }

    if (!matchedUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Face not recognized',
      });
    }

    const sessionId = await createSession(matchedUser.username);
    
    setCookie(event, 'auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.DB_HOST?.includes('localhost'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return { success: true, username: matchedUser.username };
  } catch (error: any) {
    console.error('Face Login Server Error:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during face authentication',
    });
  }
});
