import { useDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';
import { generateApiKey, hashApiKey } from '../../utils/api-key';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const body = await readBody(event);
  
  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key name is required'
    });
  }

  const { apiKey, prefix } = generateApiKey();
  const keyHash = await hashApiKey(apiKey);
  const db = useDb();
  const id = uuidv4();
  
  await db.execute(
    'INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name) VALUES (?, ?, ?, ?, ?)',
    [id, session.username, keyHash, prefix, body.name]
  );
  
  return {
    id,
    name: body.name,
    apiKey, // Return the full key only once
    prefix
  };
});
