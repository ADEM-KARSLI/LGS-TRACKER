-- Align study_resources with the current resource model: student + source only.
alter table public.study_resources
  drop column if exists subject,
  drop column if exists topic;

drop policy if exists "study_resources_select_student" on public.study_resources;
drop policy if exists "study_resources_select_parent" on public.study_resources;
drop policy if exists "study_resources_insert_parent" on public.study_resources;
drop policy if exists "study_resources_delete_parent" on public.study_resources;
drop policy if exists "study_resources_update_parent" on public.study_resources;

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
