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

export function parseDescriptor(d: any): number[] | null {
  if (!d) return null;
  try {
    let parsed = d;
    // Handle Buffer (sometimes returned by DB drivers)
    if (typeof d === 'object' && d !== null && 'type' in d && d.type === 'Buffer') {
      parsed = Buffer.from(d.data).toString('utf8');
    } else if (Buffer.isBuffer(d)) {
      parsed = d.toString('utf8');
    }
    
    // Handle Stringified JSON
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    
    // Ensure it is an array of numbers
    if (Array.isArray(parsed)) {
      return parsed.map(Number);
    }
    return null;
  } catch (e) {
    console.error('Error parsing face descriptor:', e);
    return null;
  }
}

export function euclideanDistance(arr1: number[], arr2: number[]) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length === 0) {
    console.warn(`Euclidean distance mismatch: arr1(${arr1?.length}) vs arr2(${arr2?.length})`);
    return Infinity;
  }
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
    const storedDescriptor = parseDescriptor(user.face_descriptor);
    if (!storedDescriptor) continue;

    const distance = euclideanDistance(faceDescriptor, storedDescriptor);
    
    if (distance < minDistance && distance < EUCLIDEAN_THRESHOLD) {
      minDistance = distance;
      matchedUser = user;
    }
  }

  if (matchedUser) {
    console.log(`Matched user ${matchedUser.username} with distance ${minDistance}`);
  }

  return matchedUser;
};
