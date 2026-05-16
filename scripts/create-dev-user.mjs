import pg from "pg";

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const ref = "vzfjjltrvnlqcdyyvyub";

const email = process.argv[2] ?? "demo@lgs-tracker.test";
const userPassword = process.argv[3] ?? "Demo123456!";
const name = process.argv[4] ?? "Demo Öğrenci";
const role = process.argv[5] ?? "student";

if (!dbPassword) {
  console.error("SUPABASE_DB_PASSWORD required");
  process.exit(1);
}

const encoded = encodeURIComponent(dbPassword);
const connectionString = `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  const existing = await client.query(
    "SELECT id FROM auth.users WHERE email = $1",
    [email]
  );

  let userId;
  if (existing.rows.length > 0) {
    userId = existing.rows[0].id;
    console.log("User already exists, updating profile...");
  } else {
    const meta = JSON.stringify({ name, role });
    const inserted = await client.query(
      `
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, email_change,
        email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1,
        crypt($2, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        $3::jsonb,
        NOW(),
        NOW(),
        '', '', '', ''
      )
      RETURNING id
      `,
      [email, userPassword, meta]
    );
    userId = inserted.rows[0].id;

    const identityData = JSON.stringify({
      sub: userId,
      email,
      email_verified: true,
    });

    await client.query(
      `
      INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3::jsonb,
        'email',
        NOW(), NOW(), NOW()
      )
      `,
      [userId, userId, identityData]
    );
  }

  await client.query(
    `
    INSERT INTO public.users (id, name, email, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role
    `,
    [userId, name, email, role]
  );

  console.log("Done. Login at http://localhost:3000/login");
  console.log("  Email:", email);
  console.log("  Password:", userPassword);
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
