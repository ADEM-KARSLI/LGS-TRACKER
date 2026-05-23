-- Add class metadata to study resources so subject and topic lists can be
-- filtered by the selected source's grade.

alter table public.study_resources
  add column if not exists grade text;

update public.study_resources sr
set grade = coalesce(nullif(u.grade, ''), '8')
from public.users u
where u.id = sr.student_id
  and (sr.grade is null or sr.grade = '');

update public.study_resources
set grade = '8'
where grade is null or grade = '';

alter table public.study_resources
  alter column grade set not null;

alter table public.study_resources
  drop constraint if exists study_resources_parent_student_source_unique;

alter table public.study_resources
  add constraint study_resources_parent_student_grade_source_unique
  unique (parent_id, student_id, grade, source);
