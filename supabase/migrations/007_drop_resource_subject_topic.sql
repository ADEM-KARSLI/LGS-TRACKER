-- Align study_resources with the current resource model: student + source only.
alter table public.study_resources
  drop column if exists subject,
  drop column if exists topic;
