import pg from "pg";

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const ref = process.env.SUPABASE_PROJECT_REF ?? "vzfjjltrvnlqcdyyvyub";

const parentEmail = process.argv[2] ?? "ademkarsli.official@gmail.com";
const studentNames = process.argv.slice(3);

if (!dbPassword) {
  console.error("SUPABASE_DB_PASSWORD required");
  process.exit(1);
}

if (studentNames.length === 0) {
  console.error(
    "Usage: node scripts/check-parent-demo-reset.mjs <parent-email> <student-name> [student-name...]"
  );
  process.exit(1);
}

const encoded = encodeURIComponent(dbPassword);
const candidates = [
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

let lastError;
for (const connectionString of candidates) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      `
      select
        p.email as parent_email,
        s.name as student_name,
        coalesce(t.test_count, 0) as test_count,
        coalesce(w.weak_count, 0) as weak_count,
        coalesce(r.resource_count, 0) as resource_count
      from public.users p
      join public.users s
        on s.parent_id = p.id
      left join (
        select student_id, count(*)::int as test_count
        from public.test_records
        group by student_id
      ) t on t.student_id = s.id
      left join (
        select tr.student_id, count(wq.*)::int as weak_count
        from public.weak_questions wq
        join public.test_records tr on tr.id = wq.test_id
        group by tr.student_id
      ) w on w.student_id = s.id
      left join (
        select student_id, count(*)::int as resource_count
        from public.study_resources
        group by student_id
      ) r on r.student_id = s.id
      where lower(p.email) = lower($1)
        and lower(s.name) = any($2::text[])
      order by s.name
      `,
      [parentEmail, studentNames.map((name) => name.toLowerCase())]
    );

    for (const row of result.rows) {
      console.log(
        `${row.student_name}: tests=${row.test_count}, weak_questions=${row.weak_count}, resources=${row.resource_count}, parent_email=${row.parent_email}`
      );
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    lastError = error;
    await client.end().catch(() => {});
  }
}

console.error("Check failed:", lastError?.message);
process.exit(1);
