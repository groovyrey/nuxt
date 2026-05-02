import { useDb } from './server/utils/db';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const db = useDb();
    const [rows] = await db.execute('SELECT developer_id, email, face_descriptor IS NOT NULL as has_face FROM external_users');
    console.log('External Users:', rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
