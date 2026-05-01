import { useDb } from './server/utils/db';

async function migrate() {
  const db = useDb();
  console.log('Starting migration...');

  try {
    // 1. Add threshold column to api_keys if it doesn't exist
    try {
      await db.execute('ALTER TABLE api_keys ADD COLUMN threshold FLOAT DEFAULT 0.45');
      console.log('Added threshold column to api_keys');
    } catch (e: any) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('threshold column already exists in api_keys');
      } else {
        throw e;
      }
    }

    // 2. Create webhooks table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webhooks (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          url VARCHAR(2000) NOT NULL,
          events JSON NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(username) ON DELETE CASCADE
      )
    `);
    console.log('Ensured webhooks table exists');

    // 3. Create api_usage table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS api_usage (
          id INT AUTO_INCREMENT PRIMARY KEY,
          api_key_id VARCHAR(255) NOT NULL,
          endpoint VARCHAR(255) NOT NULL,
          status_code INT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
      )
    `);
    console.log('Ensured api_usage table exists');

    // 4. Create audit_logs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          action VARCHAR(255) NOT NULL,
          details JSON,
          ip_address VARCHAR(45),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(username) ON DELETE CASCADE
      )
    `);
    console.log('Ensured audit_logs table exists');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
