const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Migration files to execute in order
const migrationFiles = [
  'protocols.sql',
  'sites_extension.sql'
];

/**
 * Run all migrations
 */
async function runMigrations() {
  console.log('Starting database migrations...');
  
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute each migration file in order
    for (const filename of migrationFiles) {
      console.log(`Applying migration: ${filename}`);
      
      // Read migration file
      const filePath = path.join(__dirname, 'migrations', filename);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Execute SQL
      await client.query(sql);
      
      console.log(`Successfully applied migration: ${filename}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('All migrations applied successfully!');
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error applying migrations:', err);
    process.exit(1);
  } finally {
    // Release client
    client.release();
  }
}

// Run migrations when executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process completed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration process failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigrations }; 