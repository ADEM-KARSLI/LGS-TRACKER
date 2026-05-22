-- Resource management is now student + source only. The legacy subject/topic
-- columns stay for compatibility with older rows and generated types.

alter table public.study_resources
  alter column subject set default 'Kaynak',
  alter column topic set default 'Kaynak';

alter table public.study_resources
  drop constraint if exists study_resources_parent_id_student_id_subject_topic_source_key;

alter table public.study_resources
  add constraint study_resources_parent_student_source_unique
  unique (parent_id, student_id, source);
