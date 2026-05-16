alter table public.weak_questions drop constraint if exists weak_questions_status_check;

alter table public.weak_questions
  add constraint weak_questions_status_check
  check (status in ('pending', 'understood', 'unsure', 'critical', 'resolved'));
