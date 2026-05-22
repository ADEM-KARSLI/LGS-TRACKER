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
const schema = readFileSync(join(__dirname, "..", "supabase", "schema.sql"), "utf8");

const resetSql = `
drop table if exists public.study_resources cascade;
drop table if exists public.weak_questions cascade;
drop table if exists public.test_records cascade;
drop table if exists public.parent_student_relations cascade;
drop table if exists public.users cascade;
drop function if exists public.handle_new_user() cascade;
delete from auth.users;
`;

let lastError;
for (const connectionString of candidates) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("begin");
    await client.query(resetSql);
    await client.query(schema);
    await client.query("commit");
    console.log("Database reset successfully via:", connectionString.replace(encoded, "***"));
    await client.end();
    process.exit(0);
  } catch (error) {
    lastError = error;
    await client.query("rollback").catch(() => {});
    await client.end().catch(() => {});
  }
}

console.error("Database reset failed:", lastError?.message);
process.exit(1);
