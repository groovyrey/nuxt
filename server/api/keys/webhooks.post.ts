import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../utils/auth';
import { useDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const body = await readBody(event);
  const { url, events } = body;

  if (!url || !events || !Array.isArray(events)) {
    throw createError({ statusCode: 400, statusMessage: 'URL and events array are required' });
  }

  const db = useDb();
  const id = uuidv4();

  await db.execute(
    'INSERT INTO webhooks (id, user_id, url, events) VALUES (?, ?, ?, ?)',
    [id, session.username, url, JSON.stringify(events)]
  );

  return { id, url, events };
});
