import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const password = process.env.SUPABASE_DB_PASSWORD;
const ref = "vzfjjltrvnlqcdyyvyub";
if (!password) {
  console.error("SUPABASE_DB_PASSWORD required");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, "..", "supabase", "migrations", "003_unsure_status.sql"),
  "utf8"
);

const client = new pg.Client({
  connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Migration 003 applied.");
} catch (e) {
  console.error(e.message);
  process.exit(1);
} finally {
  await client.end();
}
