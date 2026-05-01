import { useDb } from './server/utils/db';
import { encryptBiometrics } from './server/utils/encryption';

async function migrate() {
  const db = useDb();
  console.log('Starting encryption migration...');

  const key = process.env.BIOMETRIC_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    console.error('ERROR: BIOMETRIC_ENCRYPTION_KEY (32-byte hex) is required for migration.');
    process.exit(1);
  }

  try {
    // 1. Users table
    const [users] = await db.execute('SELECT username, face_descriptor FROM users WHERE face_descriptor IS NOT NULL');
    for (const user of (users as any[])) {
      const d = user.face_descriptor;
      if (!d) continue;

      let raw: string;
      if (typeof d === 'string') {
        raw = d;
      } else if (Buffer.isBuffer(d)) {
        raw = d.toString('utf8');
      } else {
        raw = JSON.stringify(d);
      }

      // Check if already encrypted (very basic check)
      if (!raw.includes(':')) {
        console.log(`Encrypting descriptor for user: ${user.username}`);
        const encrypted = encryptBiometrics(raw);
        await db.execute('UPDATE users SET face_descriptor = ? WHERE username = ?', [encrypted, user.username]);
      } else {
        console.log(`User ${user.username} already encrypted or has invalid format.`);
      }
    }

    // 2. External users table
    const [externalUsers] = await db.execute('SELECT developer_id, email, face_descriptor FROM external_users WHERE face_descriptor IS NOT NULL');
    for (const user of (externalUsers as any[])) {
      const d = user.face_descriptor;
      if (!d) continue;

      let raw: string;
      if (typeof d === 'string') {
        raw = d;
      } else if (Buffer.isBuffer(d)) {
        raw = d.toString('utf8');
      } else {
        raw = JSON.stringify(d);
      }

      if (!raw.includes(':')) {
        console.log(`Encrypting descriptor for external user: ${user.email}`);
        const encrypted = encryptBiometrics(raw);
        await db.execute('UPDATE external_users SET face_descriptor = ? WHERE developer_id = ? AND email = ?', [encrypted, user.developer_id, user.email]);
      } else {
        console.log(`External user ${user.email} already encrypted or has invalid format.`);
      }
    }

    console.log('Encryption migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
