import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { useDb } from './db';
import { decryptBiometrics } from './encryption';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const createSession = async (event: any, username: string) => {
  const db = useDb();
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  
  await db.execute(
    'INSERT INTO sessions (id, username, expires_at) VALUES (?, ?, ?)',
    [sessionId, username, expiresAt]
  );

  // Update last login
  await db.execute(
    'UPDATE users SET last_login_at = NOW() WHERE username = ?',
    [username]
  );

  setCookie(event, 'auth_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  });
  
  return sessionId;
};

export const getAuthSession = async (sessionId: string) => {
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

export const requireAuth = async (event: any) => {
  const sessionId = getCookie(event, 'auth_session');
  if (!sessionId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  const session = await getAuthSession(sessionId);
  if (!session) {
    deleteCookie(event, 'auth_session');
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  return session;
};

export const EUCLIDEAN_THRESHOLD = 0.45; // Slightly more relaxed for multiple samples
export const MAX_DESCRIPTORS = 12;

export function parseDescriptor(d: any): number[][] | null {
  if (!d) return null;
  try {
    let raw = d;
    
    // Handle Buffer (sometimes returned by DB drivers)
    if (typeof d === 'object' && d !== null && 'type' in d && d.type === 'Buffer') {
      raw = Buffer.from(d.data).toString('utf8');
    } else if (Buffer.isBuffer(d)) {
      raw = d.toString('utf8');
    }
    
    // Decrypt if encrypted
    const decrypted = decryptBiometrics(raw);
    let parsed = decrypted;

    // Handle Stringified JSON
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        console.error('JSON parse failed for descriptor string');
        return null;
      }
    }
    
    // Normalize to number[][]
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return null;
      
      // If it's a flat array of numbers (legacy or single descriptor), wrap it
      if (typeof parsed[0] === 'number') {
        return [parsed.map(Number)];
      }
      
      // If it's an array of arrays
      if (Array.isArray(parsed[0])) {
        return parsed.map(arr => arr.map(Number));
      }
    }
    
    console.error('Descriptor format unrecognized:', typeof parsed);
    return null;
  } catch (e) {
    console.error('Error parsing face descriptor:', e);
    return null;
  }
}

export function euclideanDistance(arr1: number[], arr2: number[]) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length === 0) {
    return Infinity;
  }
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

export function compareManyToMany(inputs: number[][], stored: number[][]) {
  if (!inputs.length || !stored.length) return Infinity;
  let minDistance = Infinity;
  for (const input of inputs) {
    if (!input) continue;
    for (const s of stored) {
      if (!s) continue;
      const dist = euclideanDistance(input, s);
      if (dist < minDistance) minDistance = dist;
    }
  }
  return minDistance;
}

import { searchFaceVector } from './milvus';

export const findMatchingUserByFace = async (faceDescriptor: number[] | number[][], targetIdentifier: string, developerId?: string, customThreshold?: number) => {
  const db = useDb();
  const threshold = customThreshold || EUCLIDEAN_THRESHOLD;
  const inputDescriptors = Array.isArray(faceDescriptor[0]) 
    ? (faceDescriptor as number[][]) 
    : [faceDescriptor as number[]];

  // 1. Try Milvus Vector Search if it's an external user search
  if (developerId) {
    // We use the first descriptor (or average) for Milvus search
    const queryVector = inputDescriptors[0];
    const milvusResult = await searchFaceVector(developerId, queryVector, threshold);
    
    if (milvusResult) {
      // If we found a candidate via Milvus, fetch their full data from MySQL to verify/return
      const [rows] = await db.execute(
        'SELECT email as username, face_descriptor FROM external_users WHERE developer_id = ? AND email = ?',
        [developerId, milvusResult.email]
      );
      const users = rows as any[];
      if (users.length > 0) {
        console.log(`[MILVUS MATCH] User: ${milvusResult.email}, Distance: ${milvusResult.distance.toFixed(4)}`);
        return users[0];
      }
    }
  }

  // 2. Fallback to Legacy MySQL Search
  let query: string;
  let params: any[] = [];
  
  if (developerId) {
    if (targetIdentifier) {
      query = 'SELECT email as username, face_descriptor FROM external_users WHERE developer_id = ? AND email = ? AND face_descriptor IS NOT NULL';
      params = [developerId, targetIdentifier];
    } else {
      query = 'SELECT email as username, face_descriptor FROM external_users WHERE developer_id = ? AND face_descriptor IS NOT NULL';
      params = [developerId];
    }
  } else {
    query = 'SELECT username, face_descriptor FROM users WHERE username = ? AND face_descriptor IS NOT NULL';
    params = [targetIdentifier];
  }

  const [rows] = await db.execute(query, params);
  const users = rows as any[];

  for (const user of users) {
    const storedDescriptors = parseDescriptor(user.face_descriptor);
    if (!storedDescriptors) continue;
    const distance = compareManyToMany(inputDescriptors, storedDescriptors);
    if (distance <= threshold) {
      return { ...user, distance };
    }
  }
  return null;
};
