-- Expand weak_questions status workflow
alter table public.weak_questions drop constraint if exists weak_questions_status_check;

alter table public.weak_questions
  add constraint weak_questions_status_check
  check (status in ('pending', 'understood', 'critical', 'resolved'));

create index if not exists idx_weak_questions_status on public.weak_questions (status);

-- Students update own weak questions
drop policy if exists "weak_update_student" on public.weak_questions;
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

-- Parents update linked students' weak questions
drop policy if exists "weak_update_parent" on public.weak_questions;
create policy "weak_update_parent" on public.weak_questions
  for update using (
    exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.test_records tr
      join public.parent_student_relations psr on psr.student_id = tr.student_id
      where tr.id = weak_questions.test_id and psr.parent_id = auth.uid()
    )
  );
