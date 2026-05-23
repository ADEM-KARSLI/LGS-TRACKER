import pg from "pg";

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const ref = process.env.SUPABASE_PROJECT_REF ?? "vzfjjltrvnlqcdyyvyub";

const oldParentEmail = process.argv[2] ?? "demo.parent@example.com";
const newParentEmail = process.argv[3] ?? "ademkarsli.official@gmail.com";
const studentNames = process.argv.slice(4);

if (!dbPassword) {
  console.error("SUPABASE_DB_PASSWORD required");
  process.exit(1);
}

if (studentNames.length === 0) {
  console.error(
    "Usage: node scripts/reset-parent-demo-data.mjs <old-parent-email> <new-parent-email> <student-name> [student-name...]"
  );
  process.exit(1);
}

const encoded = encodeURIComponent(dbPassword);
const candidates = [
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

function redact(connectionString) {
  return connectionString.replace(encoded, "***");
}

let lastError;
for (const connectionString of candidates) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("begin");

    const parentResult = await client.query(
      `
      select id, email, name
      from public.users
      where lower(email) = lower($1)
        and role = 'parent'
      limit 1
      `,
      [oldParentEmail]
    );

    if (parentResult.rows.length === 0) {
      throw new Error(`Parent user not found: ${oldParentEmail}`);
    }

    const parent = parentResult.rows[0];

    const studentsResult = await client.query(
      `
      select id, name, email
      from public.users
      where role = 'student'
        and parent_id = $1
        and lower(name) = any($2::text[])
      order by name
      `,
      [parent.id, studentNames.map((name) => name.toLowerCase())]
    );

    if (studentsResult.rows.length !== studentNames.length) {
      const found = new Set(
        studentsResult.rows.map((row) => String(row.name).toLowerCase())
      );
      const missing = studentNames.filter((name) => !found.has(name.toLowerCase()));
      throw new Error(`Student not found under parent ${oldParentEmail}: ${missing.join(", ")}`);
    }

    const studentIds = studentsResult.rows.map((row) => row.id);

    const countResult = await client.query(
      `
      select
        s.id as student_id,
        s.name,
        coalesce(t.test_count, 0) as test_count,
        coalesce(w.weak_count, 0) as weak_count,
        coalesce(r.resource_count, 0) as resource_count
      from public.users s
      left join (
        select student_id, count(*)::int as test_count
        from public.test_records
        where student_id = any($1::uuid[])
        group by student_id
      ) t on t.student_id = s.id
      left join (
        select tr.student_id, count(wq.*)::int as weak_count
        from public.weak_questions wq
        join public.test_records tr on tr.id = wq.test_id
        where tr.student_id = any($1::uuid[])
        group by tr.student_id
      ) w on w.student_id = s.id
      left join (
        select student_id, count(*)::int as resource_count
        from public.study_resources
        where student_id = any($1::uuid[])
        group by student_id
      ) r on r.student_id = s.id
      where s.id = any($1::uuid[])
      order by s.name
      `,
      [studentIds]
    );

    await client.query(
      `
      update auth.users
      set
        email = $1,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
      where id = $2
      `,
      [newParentEmail, parent.id]
    );

    await client.query(
      `
      update auth.identities
      set
        identity_data = jsonb_set(
          coalesce(identity_data, '{}'::jsonb),
          '{email}',
          to_jsonb($1::text),
          true
        ),
        updated_at = now()
      where user_id = $2
        and provider = 'email'
      `,
      [newParentEmail, parent.id]
    );

    await client.query(
      `
      update public.users
      set email = $1
      where id = $2
      `,
      [newParentEmail, parent.id]
    );

    await client.query(
      `
      delete from public.study_resources
      where student_id = any($1::uuid[])
      `,
      [studentIds]
    );

    await client.query(
      `
      delete from public.test_records
      where student_id = any($1::uuid[])
      `,
      [studentIds]
    );

    await client.query("commit");

    console.log(`Updated parent email: ${oldParentEmail} -> ${newParentEmail}`);
    console.log(`Parent: ${parent.name} (${parent.id})`);
    for (const row of countResult.rows) {
      console.log(
        `Reset ${row.name}: deleted ${row.test_count} tests, ${row.weak_count} weak questions, ${row.resource_count} resources`
      );
    }
    console.log(`Done via: ${redact(connectionString)}`);

    await client.end();
    process.exit(0);
  } catch (error) {
    lastError = error;
    await client.query("rollback").catch(() => {});
    await client.end().catch(() => {});
  }
}

console.error("Reset failed:", lastError?.message);
process.exit(1);
