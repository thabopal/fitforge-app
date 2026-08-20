import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const { Client } = pg;

function getConnectionString(): string {
  const value = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required");
  }

  return value;
}

const connectionString = getConnectionString();

async function run() {
  const url = new URL(connectionString);

  console.log("Connecting to:");
  console.log(`  Host: ${url.hostname}`);
  console.log(`  Database: ${url.pathname.slice(1)}`);
  console.log(`  Pooler: ${url.hostname.includes("-pooler")}`);

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    const db = await client.query(`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        current_user AS user
    `);

    console.log("\nDATABASE:");
    console.table(db.rows);

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\nPUBLIC TABLES:");
    console.table(tables.rows);

    const enums = await client.query(`
      SELECT typname
      FROM pg_type
      JOIN pg_namespace
        ON pg_namespace.oid = pg_type.typnamespace
      WHERE typtype = 'e'
        AND nspname = 'public'
      ORDER BY typname
    `);

    console.log("\nPUBLIC ENUMS:");
    console.table(enums.rows);

    const migrations = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%migration%'
      ORDER BY table_schema, table_name
    `);

    console.log("\nMIGRATION TABLES:");
    console.table(migrations.rows);
  } catch (error) {
    console.error("\nInspection failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
