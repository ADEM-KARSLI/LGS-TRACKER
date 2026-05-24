-- Store grade on test templates so parent-side topic dropdowns can vary by class.

alter table public.test_templates
  add column if not exists grade text;

update public.test_templates tt
set grade = coalesce(
  nullif(tt.grade, ''),
  (
    select nullif(u.grade, '')
    from public.users u
    where u.id = tt.student_id
  ),
  '8'
)
where tt.grade is null or tt.grade = '';

alter table public.test_templates
  alter column grade set not null;
