import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const password = process.env.SUPABASE_DB_PASSWORD;
const ref = process.env.SUPABASE_PROJECT_REF ?? "vzfjjltrvnlqcdyyvyub";

if (!password) {
  console.error("SUPABASE_DB_PASSWORD required");
  process.exit(1);
}

const encoded = encodeURIComponent(password);
const candidates = [
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(
    __dirname,
    "..",
    "supabase",
    "migrations",
    "007_drop_resource_subject_topic.sql"
  ),
  "utf8"
);

let lastError;
for (const connectionString of candidates) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Migration 007 applied via:", connectionString.replace(encoded, "***"));
    await client.end();
    process.exit(0);
  } catch (error) {
    lastError = error;
    await client.end().catch(() => {});
  }
}

console.error("Migration 007 failed:", lastError?.message);
process.exit(1);
