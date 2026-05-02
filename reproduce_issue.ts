
import { findMatchingUserByFace, EUCLIDEAN_THRESHOLD } from './server/utils/auth';
import { useDb } from './server/utils/db';

async function test() {
  console.log('--- Testing findMatchingUserByFace Logic ---');
  
  // Mocking some data if needed, but let's see what's in the DB first
  const db = useDb();
  
  try {
    const [users] = await db.execute('SELECT username, face_descriptor FROM users LIMIT 5');
    console.log('Users in DB:', (users as any[]).length);
    
    // Test Case 1: Loose Threshold Check
    // Create two random 128-d vectors and check their distance
    const v1 = Array.from({ length: 128 }, () => Math.random());
    const v2 = Array.from({ length: 128 }, () => Math.random());
    
    const dist = euclideanDistance(v1, v2);
    console.log('Distance between two random 128-d vectors:', dist);
    // Euclidean distance between two random vectors in [0, 1]^128 is typically around sqrt(128 * 1/6) approx 4.6
    
    // What if the vectors are closer?
    const v3 = v1.map(x => x + (Math.random() - 0.5) * 0.1);
    const dist2 = euclideanDistance(v1, v3);
    console.log('Distance between v1 and v1+noise(0.1):', dist2);
    
    if (dist2 <= 0.45) {
        console.log('v1 and v1+noise(0.1) MATCH with 0.45 threshold');
    }

    // Test Case 2: Milvus logic (if we can mock Milvus search)
    // Actually, I can't easily mock Milvus without changing the code.
    // But I can see the code logic in auth.ts is clearly wrong:
    /*
    if (milvusResult) {
      const [rows] = await db.execute(
        'SELECT email as username, face_descriptor FROM external_users WHERE developer_id = ? AND email = ?',
        [developerId, milvusResult.email]
      );
      if (users.length > 0) {
        return users[0]; // <--- BUG: returns milvusResult.email instead of checking against targetIdentifier
      }
    }
    */
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

function euclideanDistance(arr1: number[], arr2: number[]) {
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

test();
