import { useDb } from './server/utils/db';
import { useMilvus } from './server/utils/milvus';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  console.log('--- Database & Milvus Diagnostic ---');
  
  try {
    const db = useDb();
    const milvus = useMilvus();

    // 1. Check Turso
    console.log('\nChecking Turso (external_users)...');
    const [externalUsers] = await db.execute('SELECT developer_id, email, face_descriptor IS NOT NULL as has_face FROM external_users');
    console.table(externalUsers);

    // 2. Check Milvus
    if (milvus) {
      console.log('\nChecking Milvus (face_templates)...');
      try {
        const stats = await milvus.getCollectionStatistics({ collection_name: 'face_templates' });
        console.log('Collection Statistics:', stats.stats);

        const results = await milvus.query({
          collection_name: 'face_templates',
          filter: '',
          output_fields: ['developer_id', 'email'],
          limit: 100
        });
        console.log('Vectors in Milvus:');
        console.table(results.data);
      } catch (err) {
        console.error('Milvus query failed:', err.message);
      }
    } else {
      console.log('Milvus client not initialized (check MILVUS_ADDRESS/TOKEN)');
    }

  } catch (e) {
    console.error('Diagnostic error:', e);
  } finally {
    process.exit();
  }
}
run();
