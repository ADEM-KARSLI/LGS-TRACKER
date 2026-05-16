import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const email = `test.student.${Date.now()}@example.com`;
const password = "TestPass123!";

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name: "Test Öğrenci", role: "student" } },
});

if (error) {
  console.error("Signup failed:", error.message);
  process.exit(1);
}

console.log("Signup OK:", data.user?.id);

if (data.user) {
  const { error: profileError } = await supabase.from("users").upsert({
    id: data.user.id,
    name: "Test Öğrenci",
    email,
    role: "student",
  });
  if (profileError) {
    console.log("Profile upsert:", profileError.message);
  } else {
    console.log("Profile OK");
  }
}
