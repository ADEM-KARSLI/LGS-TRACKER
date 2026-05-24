-- LGS Tracker MVP schema
-- Run in Supabase SQL Editor after creating your project.

-- Custom user profiles (linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('student', 'parent')),
  username text,
  grade text,
  parent_id uuid references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_users_username_unique
  on public.users (lower(username))
  where username is not null;
create index if not exists idx_users_parent_id on public.users (parent_id)
  where parent_id is not null;

alter table public.users drop constraint if exists users_student_required_fields;
alter table public.users
  add constraint users_student_required_fields
  check (
    role <> 'student'
    or (username is not null and grade is not null and parent_id is not null)
  ) not valid;

create table if not exists public.parent_student_relations (
  parent_id uuid not null references public.users (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id),
  check (parent_id <> student_id)
);

create table if not exists public.test_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users (id) on delete cascade,
  subject text not null,
  topic text not null,
  source text not null,
  test_no int not null check (test_no > 0),
  page_no int check (page_no > 0),
  total_questions int not null check (total_questions > 0),
  correct_count int not null check (correct_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.weak_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.test_records (id) on delete cascade,
  question_no int not null check (question_no > 0),
  status text not null default 'pending' check (status in ('pending', 'understood', 'unsure', 'critical', 'resolved')),
  created_at timestamptz not null default now(),
  unique (test_id, question_no)
);

create index if not exists idx_test_records_student on public.test_records (student_id, created_at desc);
create index if not exists idx_weak_questions_test on public.weak_questions (test_id);

create table if not exists public.study_resources (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  grade text not null,
  subject text not null,
  source text not null,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id, grade, subject, source)
);

create table if not exists public.test_templates (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  source text not null,
  subject text not null,
  topic text not null,
  test_no int not null check (test_no > 0),
  page_no int not null check (page_no > 0),
  total_questions int not null check (total_questions > 0),
  created_at timestamptz not null default now(),
  unique (student_id, source, page_no)
);

create index if not exists idx_study_resources_student on public.study_resources (student_id, created_at desc);
create index if not exists idx_study_resources_parent on public.study_resources (parent_id, created_at desc);
create index if not exists idx_test_templates_student on public.test_templates (student_id, source, page_no);
create index if not exists idx_test_templates_parent on public.test_templates (parent_id, created_at desc);

alter table public.study_resources enable row level security;
alter table public.test_templates enable row level security;

create policy "study_resources_select_student" on public.study_resources
  for select using (student_id = auth.uid());

create policy "study_resources_select_parent" on public.study_resources
  for select using (parent_id = auth.uid());

create policy "study_resources_insert_parent" on public.study_resources
  for insert with check (
    study_resources.parent_id = auth.uid() and (
      exists (
        select 1 from public.users u
        where u.id = study_resources.student_id
          and u.parent_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_student_relations psr
        where psr.parent_id = auth.uid()
          and psr.student_id = study_resources.student_id
      )
    )
  );

create policy "study_resources_delete_parent" on public.study_resources
  for delete using (parent_id = auth.uid());

create policy "study_resources_update_parent" on public.study_resources
  for update using (parent_id = auth.uid()) with check (parent_id = auth.uid());

create policy "test_templates_select_student" on public.test_templates
  for select using (student_id = auth.uid());

create policy "test_templates_select_parent" on public.test_templates
  for select using (parent_id = auth.uid());

create policy "test_templates_insert_parent" on public.test_templates
  for insert with check (
    test_templates.parent_id = auth.uid() and (
      exists (
        select 1 from public.users u
        where u.id = test_templates.student_id
          and u.parent_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_student_relations psr
        where psr.parent_id = auth.uid()
          and psr.student_id = test_templates.student_id
      )
    )
  );

create policy "test_templates_delete_parent" on public.test_templates
  for delete using (parent_id = auth.uid());

create policy "test_templates_update_parent" on public.test_templates
  for update using (parent_id = auth.uid()) with check (parent_id = auth.uid());

alter table public.users enable row level security;
alter table public.parent_student_relations enable row level security;
alter table public.test_records enable row level security;
alter table public.weak_questions enable row level security;

-- Users: read own profile; parents can read linked students
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_select_linked_student" on public.users
  for select using (
    parent_id = auth.uid() or
    exists (
      select 1 from public.parent_student_relations psr
      where psr.parent_id = auth.uid() and psr.student_id = users.id
    )
  );

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Relations: parents manage their links (MVP: insert/select own rows)
create policy "relations_select_own" on public.parent_student_relations
  for select using (parent_id = auth.uid() or student_id = auth.uid());

create policy "relations_insert_parent" on public.parent_student_relations
  for insert with check (parent_id = auth.uid());

-- Test records: students CRUD own; parents read linked
create policy "tests_select_own" on public.test_records
  for select using (student_id = auth.uid());

create policy "tests_select_parent" on public.test_records
  for select using (
    exists (
      select 1 from public.users u
      where u.id = test_records.student_id and u.parent_id = auth.uid()
    ) or
    exists (
      select 1 from public.parent_student_relations psr
      where psr.parent_id = auth.uid() and psr.student_id = test_records.student_id
    )
  );

create policy "tests_insert_own" on public.test_records
  for insert with check (student_id = auth.uid());

-- Weak questions: via test ownership
create policy "weak_select_own" on public.weak_questions
  for select using (
    exists (
      select 1 from public.test_records tr
      where tr.id = weak_questions.test_id and tr.student_id = auth.uid()
    )
  );

create policy "weak_select_parent" on public.weak_questions
  for select using (
    exists (
      select 1 from public.test_records tr
      join public.users u on u.id = tr.student_id
      where tr.id = weak_questions.test_id and u.parent_id = auth.uid()
    ) or
    exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  );

create policy "weak_insert_own" on public.weak_questions
  for insert with check (
    exists (
      select 1 from public.test_records tr
      where tr.id = weak_questions.test_id and tr.student_id = auth.uid()
    )
  );

create policy "weak_update_student" on public.weak_questions
  for update using (
    exists (
      select 1 from public.test_records tr
      where tr.id = weak_questions.test_id and tr.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.test_records tr
      where tr.id = weak_questions.test_id and tr.student_id = auth.uid()
    )
  );

create policy "weak_update_parent" on public.weak_questions
  for update using (
    exists (
      select 1 from public.test_records tr
      join public.users u on u.id = tr.student_id
      where tr.id = weak_questions.test_id and u.parent_id = auth.uid()
    ) or
    exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.test_records tr
      join public.users u on u.id = tr.student_id
      where tr.id = weak_questions.test_id and u.parent_id = auth.uid()
    ) or
    exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  );

-- Auto-create profile on signup (optional; app also inserts on register)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (
    id,
    name,
    email,
    role,
    username,
    grade,
    parent_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(new.raw_user_meta_data->>'grade', ''),
    nullif(new.raw_user_meta_data->>'parent_id', '')::uuid
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    username = excluded.username,
    grade = excluded.grade,
    parent_id = excluded.parent_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
