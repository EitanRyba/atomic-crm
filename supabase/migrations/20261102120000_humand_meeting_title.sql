-- Humand meeting title.
-- Demo and meeting tasks get a title of their own: the summary of their
-- Google Calendar event, which the guests see. Their description (tasks.text)
-- is optional; tasks.text was already nullable, so it needs no change.

alter table public.tasks add column if not exists meeting_title text;
