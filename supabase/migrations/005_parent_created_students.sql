-- Parent-created student accounts.
-- Existing parent/student auth remains Supabase email/password based. Students
-- use generated emails like username@student.app and keep their real login name
-- in public.users.username.

alter table public.users
  add column if not exists username text,
  add column if not exists grade text,
  add column if not exists parent_id uuid references public.users (id) on delete cascade;

create unique index if not exists idx_users_username_unique
  on public.users (lower(username))
  where username is not null;

create index if not exists idx_users_parent_id
  on public.users (parent_id)
  where parent_id is not null;

alter table public.users drop constraint if exists users_student_required_fields;
alter table public.users
  add constraint users_student_required_fields
  check (
    role <> 'student'
    or (username is not null and grade is not null and parent_id is not null)
  ) not valid;

-- Keep the auth trigger aware of parent-created student metadata.
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

-- Parents can read students linked either by legacy relation rows or parent_id.
drop policy if exists "users_select_linked_student" on public.users;
create policy "users_select_linked_student" on public.users
  for select using (
    parent_id = auth.uid()
    or exists (
      select 1 from public.parent_student_relations psr
      where psr.parent_id = auth.uid() and psr.student_id = users.id
    )
  );

drop policy if exists "tests_select_parent" on public.test_records;
create policy "tests_select_parent" on public.test_records
  for select using (
    exists (
      select 1 from public.users u
      where u.id = test_records.student_id and u.parent_id = auth.uid()
    )
    or exists (
      select 1 from public.parent_student_relations psr
      where psr.parent_id = auth.uid() and psr.student_id = test_records.student_id
    )
  );

drop policy if exists "weak_select_parent" on public.weak_questions;
create policy "weak_select_parent" on public.weak_questions
  for select using (
    exists (
      select 1
      from public.test_records tr
      join public.users u on u.id = tr.student_id
      where tr.id = weak_questions.test_id and u.parent_id = auth.uid()
    )
    or exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  );

drop policy if exists "weak_update_parent" on public.weak_questions;
create policy "weak_update_parent" on public.weak_questions
  for update using (
    exists (
      select 1
      from public.test_records tr
      join public.users u on u.id = tr.student_id
      where tr.id = weak_questions.test_id and u.parent_id = auth.uid()
    )
    or exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.test_records tr
      join public.users u on u.id = tr.student_id
      where tr.id = weak_questions.test_id and u.parent_id = auth.uid()
    )
    or exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  );

drop policy if exists "study_resources_insert_parent" on public.study_resources;
create policy "study_resources_insert_parent" on public.study_resources
  for insert with check (
    parent_id = auth.uid()
    and (
      exists (
        select 1 from public.users u
        where u.id = student_id and u.parent_id = auth.uid()
      )
      or exists (
        select 1 from public.parent_student_relations psr
        where psr.parent_id = auth.uid() and psr.student_id = student_id
      )
    )
  );
