-- Restore subject metadata on study resources and add page numbers to tests.

alter table public.study_resources
  add column if not exists subject text;

update public.study_resources sr
set subject = coalesce(
  nullif(sr.subject, ''),
  (
    select tr.subject
    from public.test_records tr
    where tr.student_id = sr.student_id
      and tr.source = sr.source
    order by tr.created_at desc
    limit 1
  ),
  case when sr.grade = '7' then 'Turkce' else 'Matematik' end
)
where sr.subject is null or sr.subject = '';

alter table public.study_resources
  alter column subject set not null;

alter table public.study_resources
  drop constraint if exists study_resources_parent_student_grade_source_unique;

alter table public.study_resources
  add constraint study_resources_parent_student_grade_subject_source_unique
  unique (parent_id, student_id, grade, subject, source);

alter table public.test_records
  add column if not exists page_no int check (page_no > 0);
