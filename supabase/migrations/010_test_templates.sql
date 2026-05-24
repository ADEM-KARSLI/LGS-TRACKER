-- Introduce parent-managed test templates for source + page based student test entry.

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

create index if not exists idx_test_templates_student
  on public.test_templates (student_id, source, page_no);

create index if not exists idx_test_templates_parent
  on public.test_templates (parent_id, created_at desc);

alter table public.test_templates enable row level security;

drop policy if exists "test_templates_select_student" on public.test_templates;
drop policy if exists "test_templates_select_parent" on public.test_templates;
drop policy if exists "test_templates_insert_parent" on public.test_templates;
drop policy if exists "test_templates_delete_parent" on public.test_templates;
drop policy if exists "test_templates_update_parent" on public.test_templates;

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
