import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { useDb } from './db';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const createSession = async (username: string) => {
  const db = useDb();
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  
  await db.execute(
    'INSERT INTO sessions (id, username, expires_at) VALUES (?, ?, ?)',
    [sessionId, username, expiresAt]
  );
  
  return sessionId;
};

export const getSession = async (sessionId: string) => {
  const db = useDb();
  const [rows] = await db.execute(
    'SELECT s.*, u.email, u.gender, u.age FROM sessions s JOIN users u ON s.username = u.username WHERE s.id = ? AND s.expires_at > NOW()',
    [sessionId]
  );
  
  const sessions = rows as any[];
  return sessions.length > 0 ? sessions[0] : null;
};

export const deleteSession = async (sessionId: string) => {
  const db = useDb();
  await db.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
};

export const EUCLIDEAN_THRESHOLD = 0.6;

export function euclideanDistance(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

export const findMatchingUserByFace = async (faceDescriptor: number[]) => {
  const db = useDb();
  const [rows] = await db.execute('SELECT username, face_descriptor FROM users WHERE face_descriptor IS NOT NULL');
  const users = rows as any[];

  let matchedUser = null;
  let minDistance = Infinity;

  for (const user of users) {
    try {
      let storedDescriptor;
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

  return matchedUser;
};
