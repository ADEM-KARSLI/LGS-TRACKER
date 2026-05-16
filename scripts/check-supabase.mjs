import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

const health = await fetch(`${url}/auth/v1/health`);
console.log("Auth health:", health.status, await health.text());

const { error: usersError } = await supabase.from("users").select("id").limit(1);
if (usersError) {
  console.log("users table:", usersError.message);
} else {
  console.log("users table: OK");
}
