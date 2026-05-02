import { useDb } from './server/utils/db';
import { upsertFaceVector, initMilvus } from './server/utils/milvus';
import { parseDescriptor } from './server/utils/auth';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  console.log('--- Repairing Milvus Sync ---');
  
  try {
    const db = useDb();
    
    // 1. Ensure Milvus is initialized (Collection exists)
    console.log('Initializing Milvus...');
    await initMilvus();

    // 2. Fetch all users from Turso
    console.log('Fetching users from Turso...');
    const [users] = await db.execute('SELECT developer_id, email, face_descriptor FROM external_users WHERE face_descriptor IS NOT NULL');
    const userList = users as any[];
    console.log(`Found ${userList.length} users with face data.`);

    // 3. Sync each user to Milvus
    for (const user of userList) {
      console.log(`\nSyncing: ${user.email}...`);
      
      const descriptors = parseDescriptor(user.face_descriptor);
      
      if (!descriptors || descriptors.length === 0) {
        console.warn(`  - No valid descriptor found for ${user.email}, skipping.`);
        continue;
      }

      // Average multiple descriptors if needed
      let vectorToStore: number[];
      if (descriptors.length > 1) {
        const length = descriptors[0].length;
        const avg = new Array(length).fill(0);
        for (const d of descriptors) {
          for (let i = 0; i < length; i++) avg[i] += d[i];
        }
        vectorToStore = avg.map(v => v / descriptors.length);
      } else {
        vectorToStore = descriptors[0];
      }

      try {
        await upsertFaceVector(user.developer_id, user.email, vectorToStore);
        console.log(`  ✓ Successfully synced to Milvus.`);
      } catch (err) {
        console.error(`  ✗ Failed to sync ${user.email}:`, err.message);
      }
    }

    console.log('\n--- Repair Complete ---');
    console.log('Run npx tsx debug_sync.ts again to verify.');

  } catch (e) {
    console.error('Repair failed:', e);
  } finally {
    process.exit();
  }
}
run();
