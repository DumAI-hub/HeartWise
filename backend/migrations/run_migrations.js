import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dibs',
  port: process.env.DB_PORT || 3306
};

async function runMigrations() {
  let connection;
  
  try {
    console.log('[MIGRATION] Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('[MIGRATION] Connected to database');
    
    // Create migrations tracking table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Migrations table ready');
    
    // Get list of completed migrations
    const [completedMigrations] = await connection.execute(
      'SELECT migration_name FROM migrations'
    );
    const completed = new Set(completedMigrations.map(row => row.migration_name));
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, '.');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`[MIGRATION] Found ${files.length} migration file(s)`);
    console.log(`[MIGRATION] Already executed: ${completed.size} migration(s)`);
    
    let executedCount = 0;
    
    // Execute each migration
    for (const file of files) {
      const migrationName = file.replace('.sql', '');
      
      if (completed.has(migrationName)) {
        console.log(`[MIGRATION] Skipping ${file} (already executed)`);
        continue;
      }
      
      console.log(`[MIGRATION] Executing ${file}...`);
      
      try {
        const sqlContent = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );
        
        // Remove comment lines first, then split by semicolon
        const cleanedContent = sqlContent
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n');
        
        const statements = cleanedContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const statement of statements) {
          await connection.execute(statement);
        }
        
        // Mark migration as completed
        await connection.execute(
          'INSERT INTO migrations (migration_name) VALUES (?)',
          [migrationName]
        );
        
        console.log(`[MIGRATION] Successfully executed ${file}`);
        executedCount++;
        
      } catch (error) {
        console.error(`[MIGRATION ERROR] ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log(`[MIGRATION] Completed! Executed ${executedCount} new migration(s)`);
    
  } catch (error) {
    console.error('[MIGRATION ERROR] Failed:', error);
    throw error; // Re-throw for caller to handle
  } finally {
    if (connection) {
      await connection.end();
      console.log('[MIGRATION] Database connection closed');
    }
  }
}

// Export for use in server.js
export default runMigrations;

// Run migrations if called directly from CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch(error => {
    console.error('Migration process failed:', error.message);
    process.exit(1);
  });
}
