-- Add parent-managed study resources for student test entry

create table if not exists public.study_resources (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  subject text not null,
  topic text not null,
  source text not null,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id, subject, topic, source)
);

create index if not exists idx_study_resources_student on public.study_resources (student_id, created_at desc);
create index if not exists idx_study_resources_parent on public.study_resources (parent_id, created_at desc);

alter table public.study_resources enable row level security;

create policy "study_resources_select_student" on public.study_resources
  for select using (student_id = auth.uid());

create policy "study_resources_select_parent" on public.study_resources
  for select using (parent_id = auth.uid());

create policy "study_resources_insert_parent" on public.study_resources
  for insert with check (
    parent_id = auth.uid() and
    exists (
      select 1 from public.parent_student_relations psr
      where psr.parent_id = auth.uid() and psr.student_id = student_id
    )
  );

create policy "study_resources_delete_parent" on public.study_resources
  for delete using (parent_id = auth.uid());

create policy "study_resources_update_parent" on public.study_resources
  for update using (parent_id = auth.uid()) with check (parent_id = auth.uid());
