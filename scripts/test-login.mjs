import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "demo@lgs-tracker.test",
  password: "Demo123456!",
});

if (error) {
  console.error("Login failed:", error.message);
  process.exit(1);
}

console.log("Login OK, user:", data.user?.id);
