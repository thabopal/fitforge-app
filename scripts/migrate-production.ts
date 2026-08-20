import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

config({ path: ".env.local" });

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    console.log("Connecting to production database...");

    const db = drizzle(pool);

    await migrate(db, {
      migrationsFolder: "./src/db/migrations",
    });

    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
