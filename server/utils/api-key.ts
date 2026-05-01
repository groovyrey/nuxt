import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { useDb } from './db';

const KEY_PREFIX = 'lf_';

export const generateApiKey = () => {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const apiKey = `${KEY_PREFIX}${randomBytes}`;
  const prefix = apiKey.substring(0, 7); // lf_ + 4 chars
  return { apiKey, prefix };
};

export const hashApiKey = async (apiKey: string) => {
  return await bcrypt.hash(apiKey, 10);
};

export const validateApiKey = async (apiKey: string) => {
  if (!apiKey.startsWith(KEY_PREFIX)) return null;
  
  const prefix = apiKey.substring(0, 7);
  const db = useDb();
  
  const [rows] = await db.execute(
    'SELECT * FROM api_keys WHERE key_prefix = ?',
    [prefix]
  );
  
  const keys = rows as any[];
  
  for (const key of keys) {
    const isValid = await bcrypt.compare(apiKey, key.key_hash);
    if (isValid) {
      // Update last used at
      await db.execute(
        'UPDATE api_keys SET last_used_at = NOW() WHERE id = ?',
        [key.id]
      );
      return key.user_id;
    }
  }
  
  return null;
};

export const updateExternalUserActivity = async (developerId: string, email: string) => {
  const db = useDb();
  await db.execute(
    'UPDATE external_users SET last_seen_at = NOW() WHERE developer_id = ? AND email = ?',
    [developerId, email]
  );
};
