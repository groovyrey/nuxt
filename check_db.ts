import { useDb } from './server/utils/db';
async function run() {
  try {
    const db = useDb();
    const [rows] = await db.execute('SELECT count(*) as count FROM users');
    console.log('User count:', (rows as any)[0].count);
    const [users] = await db.execute('SELECT username, face_descriptor IS NOT NULL as has_face FROM users');
    console.log('Users:', users);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
