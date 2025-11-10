const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env file');
    process.exit(1);
  }

  const urlParts = new URL(databaseUrl);
  const dbName = urlParts.pathname.substring(1);
  const username = urlParts.username;
  const password = urlParts.password;
  const host = urlParts.hostname;
  const port = urlParts.port;

  const client = new Client({
    user: username,
    host: host,
    password: password,
    port: port,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
    const result = await client.query(checkDbQuery);

    if (result.rowCount > 0) {
      console.log(`Database '${dbName}' already exists`);
    } else {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully`);
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
