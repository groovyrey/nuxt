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
  const body = await readBody(event);
  const { faceDescriptor } = body;

  if (!faceDescriptor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing face descriptor',
    });
  }

  const db = useDb();
  const [rows] = await db.execute('SELECT username, face_descriptor FROM users WHERE face_descriptor IS NOT NULL');
  const users = rows as any[];

  let matchedUser = null;
  let minDistance = Infinity;

  for (const user of users) {
    const storedDescriptor = JSON.parse(user.face_descriptor);
    const distance = euclideanDistance(faceDescriptor, storedDescriptor);
    
    if (distance < minDistance && distance < EUCLIDEAN_THRESHOLD) {
      minDistance = distance;
      matchedUser = user;
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
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return { success: true, username: matchedUser.username };
});
