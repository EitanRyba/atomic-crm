-- Humand company categories.
-- Every contact belongs to a company. Contacts whose company is unknown are
-- attached to the system company "Por definir" (is_placeholder), which can be
-- neither renamed, deleted, categorized nor linked to deals.
-- A company is a client company and/or a referral company, and a client
-- company may be referred by the referral company that introduced it.

-- a) Categories and referral link. Existing companies become clients.
alter table public.companies add column if not exists is_client boolean not null default true;
alter table public.companies add column if not exists is_referral boolean not null default false;
alter table public.companies add column if not exists is_placeholder boolean not null default false;
alter table public.companies add column if not exists referred_by_company_id bigint;

alter table public.companies drop constraint if exists companies_category_check;
alter table public.companies
    add constraint companies_category_check check (is_placeholder or is_client or is_referral);

alter table public.companies drop constraint if exists companies_referred_by_not_self_check;
alter table public.companies
    add constraint companies_referred_by_not_self_check check (referred_by_company_id <> id);

alter table public.companies drop constraint if exists companies_referred_by_company_id_fkey;
alter table public.companies
    add constraint companies_referred_by_company_id_fkey foreign key (referred_by_company_id) references public.companies(id) on delete set null;

create index if not exists companies_referred_by_company_id_idx on public.companies using btree (referred_by_company_id);

-- Only one placeholder company can exist.
create unique index if not exists companies_single_placeholder_idx on public.companies using btree (is_placeholder) where is_placeholder;

-- b) The "Por definir" system company.
insert into public.companies (name, is_client, is_referral, is_placeholder, sales_id)
select 'Por definir', false, false, true, null
where not exists (select 1 from public.companies where is_placeholder);

-- c) Contacts without a company move to "Por definir". The avatar trigger is
-- disabled meanwhile: it would query Gravatar for every moved contact.
alter table public.contacts disable trigger "20_contact_saved";

update public.contacts
set company_id = (select id from public.companies where is_placeholder)
where company_id is null;

alter table public.contacts enable trigger "20_contact_saved";

-- d) Every contact belongs to a company.
alter table public.contacts alter column company_id set not null;

-- e) Deleting a company no longer deletes its contacts silently: the
-- delete_company function decides what happens to them.
alter table public.contacts drop constraint if exists contacts_company_id_fkey;
alter table public.contacts
    add constraint contacts_company_id_fkey foreign key (company_id) references public.companies(id) on update cascade on delete restrict;

-- f) Integrity of the placeholder company.
create or replace function public.protect_placeholder_company() returns trigger
    language plpgsql security definer
    set search_path to ''
    as $$
begin
  if tg_op = 'DELETE' then
    if old.is_placeholder then
      raise exception 'The system company "%" cannot be deleted', old.name;
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if new.is_placeholder is distinct from old.is_placeholder then
      raise exception 'The placeholder flag of a company cannot be changed';
    end if;
    if old.is_placeholder and new.name is distinct from old.name then
      raise exception 'The system company "%" cannot be renamed', old.name;
    end if;
  end if;

  if new.is_placeholder and (new.is_client or new.is_referral) then
    raise exception 'The system company "%" cannot have categories', new.name;
  end if;

  if new.is_placeholder and new.referred_by_company_id is not null then
    raise exception 'The system company "%" cannot be referred by a company', new.name;
  end if;

  if new.referred_by_company_id is not null and exists (
    select 1 from public.companies
    where id = new.referred_by_company_id and is_placeholder
  ) then
    raise exception 'A company cannot be referred by the system company';
  end if;

  return new;
end;
$$;

create or replace function public.reject_deals_on_placeholder_company() returns trigger
    language plpgsql security definer
    set search_path to ''
    as $$
begin
  if new.company_id is not null
    and (tg_op = 'INSERT' or new.company_id is distinct from old.company_id)
    and exists (
      select 1 from public.companies
      where id = new.company_id and is_placeholder
    )
  then
    raise exception 'Deals cannot be linked to the system company';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_placeholder_company on public.companies;
create trigger protect_placeholder_company
    before insert or update or delete on public.companies
    for each row execute function public.protect_placeholder_company();

drop trigger if exists reject_deals_on_placeholder_company on public.deals;
create trigger reject_deals_on_placeholder_company
    before insert or update of company_id on public.deals
    for each row execute function public.reject_deals_on_placeholder_company();

-- Deletes a company and decides the fate of its contacts in one transaction:
-- 'move' reassigns them to "Por definir", 'delete' deletes them (with their
-- notes and tasks). The deals of the company are deleted with it, as before.
-- Returns the number of contacts moved or deleted.
create or replace function public.delete_company(target_company_id bigint, contacts_mode text) returns integer
    language plpgsql
    set search_path to ''
    as $$
declare
  placeholder_id bigint;
  affected_contacts integer;
begin
  if contacts_mode is null or contacts_mode not in ('move', 'delete') then
    raise exception 'Invalid contacts_mode "%": expected "move" or "delete"', contacts_mode
      using errcode = '22023';
  end if;

  if not exists (select 1 from public.companies where id = target_company_id) then
    raise exception 'Company % not found', target_company_id
      using errcode = 'P0002';
  end if;

  if contacts_mode = 'move' then
    select id into placeholder_id from public.companies where is_placeholder;
    if placeholder_id is null then
      raise exception 'The system company "Por definir" is missing';
    end if;

    update public.contacts
    set company_id = placeholder_id
    where company_id = target_company_id;
  else
    delete from public.contacts where company_id = target_company_id;
  end if;

  get diagnostics affected_contacts = row_count;

  delete from public.companies where id = target_company_id;

  return affected_contacts;
end;
$$;

revoke all on function public.delete_company(bigint, text) from public;
revoke all on function public.delete_company(bigint, text) from anon;
grant all on function public.delete_company(bigint, text) to authenticated;
grant all on function public.delete_company(bigint, text) to service_role;

grant all on function public.protect_placeholder_company() to anon;
grant all on function public.protect_placeholder_company() to authenticated;
grant all on function public.protect_placeholder_company() to service_role;

grant all on function public.reject_deals_on_placeholder_company() to anon;
grant all on function public.reject_deals_on_placeholder_company() to authenticated;
grant all on function public.reject_deals_on_placeholder_company() to service_role;

-- Merging contacts keeps a real company over "Por definir", and the buying role.
CREATE OR REPLACE FUNCTION public.merge_contacts(loser_id bigint, winner_id bigint)
RETURNS bigint
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  winner_contact contacts%ROWTYPE;
  loser_contact contacts%ROWTYPE;
  deal_record RECORD;
  merged_emails jsonb;
  merged_phones jsonb;
  merged_tags bigint[];
  winner_emails jsonb;
  loser_emails jsonb;
  winner_phones jsonb;
  loser_phones jsonb;
  email_map jsonb;
  phone_map jsonb;
  winner_company_is_placeholder boolean;
  loser_company_is_placeholder boolean;
  merged_company_id bigint;
BEGIN
  -- Fetch both contacts
  SELECT * INTO winner_contact FROM contacts WHERE id = winner_id;
  SELECT * INTO loser_contact FROM contacts WHERE id = loser_id;

  IF winner_contact IS NULL OR loser_contact IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  -- 1. Reassign tasks from loser to winner
  UPDATE tasks SET contact_id = winner_id WHERE contact_id = loser_id;

  -- 2. Reassign contact notes from loser to winner
  UPDATE contact_notes SET contact_id = winner_id WHERE contact_id = loser_id;

  -- 3. Update deals - replace loser with winner in contact_ids array
  FOR deal_record IN
    SELECT id, contact_ids
    FROM deals
    WHERE contact_ids @> ARRAY[loser_id]
  LOOP
    UPDATE deals
    SET contact_ids = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(
          array_remove(deal_record.contact_ids, loser_id) || ARRAY[winner_id]
        )
      )
    )
    WHERE id = deal_record.id;
  END LOOP;

  -- 4. Merge contact data

  -- Get email arrays
  winner_emails := COALESCE(winner_contact.email_jsonb, '[]'::jsonb);
  loser_emails := COALESCE(loser_contact.email_jsonb, '[]'::jsonb);

  -- Merge emails with deduplication by email address
  -- Build a map of email -> email object, then convert back to array
  email_map := '{}'::jsonb;

  -- Add winner emails to map
  IF jsonb_array_length(winner_emails) > 0 THEN
    FOR i IN 0..jsonb_array_length(winner_emails)-1 LOOP
      email_map := email_map || jsonb_build_object(
        winner_emails->i->>'email',
        winner_emails->i
      );
    END LOOP;
  END IF;

  -- Add loser emails to map (won't overwrite existing keys)
  IF jsonb_array_length(loser_emails) > 0 THEN
    FOR i IN 0..jsonb_array_length(loser_emails)-1 LOOP
      IF NOT email_map ? (loser_emails->i->>'email') THEN
        email_map := email_map || jsonb_build_object(
          loser_emails->i->>'email',
          loser_emails->i
        );
      END IF;
    END LOOP;
  END IF;

  -- Convert map back to array
  merged_emails := (SELECT jsonb_agg(value) FROM jsonb_each(email_map));
  merged_emails := COALESCE(merged_emails, '[]'::jsonb);

  -- Get phone arrays
  winner_phones := COALESCE(winner_contact.phone_jsonb, '[]'::jsonb);
  loser_phones := COALESCE(loser_contact.phone_jsonb, '[]'::jsonb);

  -- Merge phones with deduplication by number
  phone_map := '{}'::jsonb;

  -- Add winner phones to map
  IF jsonb_array_length(winner_phones) > 0 THEN
    FOR i IN 0..jsonb_array_length(winner_phones)-1 LOOP
      phone_map := phone_map || jsonb_build_object(
        winner_phones->i->>'number',
        winner_phones->i
      );
    END LOOP;
  END IF;

  -- Add loser phones to map (won't overwrite existing keys)
  IF jsonb_array_length(loser_phones) > 0 THEN
    FOR i IN 0..jsonb_array_length(loser_phones)-1 LOOP
      IF NOT phone_map ? (loser_phones->i->>'number') THEN
        phone_map := phone_map || jsonb_build_object(
          loser_phones->i->>'number',
          loser_phones->i
        );
      END IF;
    END LOOP;
  END IF;

  -- Convert map back to array
  merged_phones := (SELECT jsonb_agg(value) FROM jsonb_each(phone_map));
  merged_phones := COALESCE(merged_phones, '[]'::jsonb);

  -- Merge tags (remove duplicates)
  merged_tags := ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(winner_contact.tags, ARRAY[]::bigint[]) ||
      COALESCE(loser_contact.tags, ARRAY[]::bigint[])
    )
  );

  -- A real company wins over the "Por definir" placeholder company
  SELECT is_placeholder INTO winner_company_is_placeholder FROM companies WHERE id = winner_contact.company_id;
  SELECT is_placeholder INTO loser_company_is_placeholder FROM companies WHERE id = loser_contact.company_id;
  merged_company_id := CASE
    WHEN COALESCE(winner_company_is_placeholder, true)
      AND NOT COALESCE(loser_company_is_placeholder, true)
    THEN loser_contact.company_id
    ELSE COALESCE(winner_contact.company_id, loser_contact.company_id)
  END;

  -- 5. Update winner with merged data
  UPDATE contacts SET
    avatar = COALESCE(winner_contact.avatar, loser_contact.avatar),
    gender = COALESCE(winner_contact.gender, loser_contact.gender),
    first_name = COALESCE(winner_contact.first_name, loser_contact.first_name),
    last_name = COALESCE(winner_contact.last_name, loser_contact.last_name),
    title = COALESCE(winner_contact.title, loser_contact.title),
    buyer_role = COALESCE(winner_contact.buyer_role, loser_contact.buyer_role),
    company_id = merged_company_id,
    email_jsonb = merged_emails,
    phone_jsonb = merged_phones,
    linkedin_url = COALESCE(winner_contact.linkedin_url, loser_contact.linkedin_url),
    background = COALESCE(winner_contact.background, loser_contact.background),
    has_newsletter = COALESCE(winner_contact.has_newsletter, loser_contact.has_newsletter),
    first_seen = LEAST(COALESCE(winner_contact.first_seen, loser_contact.first_seen), COALESCE(loser_contact.first_seen, winner_contact.first_seen)),
    last_seen = GREATEST(COALESCE(winner_contact.last_seen, loser_contact.last_seen), COALESCE(loser_contact.last_seen, winner_contact.last_seen)),
    sales_id = COALESCE(winner_contact.sales_id, loser_contact.sales_id),
    tags = merged_tags
  WHERE id = winner_id;

  -- 6. Delete loser contact
  DELETE FROM contacts WHERE id = loser_id;

  RETURN winner_id;
END;
$$;

-- g) and h) The summary views expose the new fields. New columns are appended
-- so that the views can be replaced in place, keeping their grants.
create or replace view public.companies_summary with (security_invoker = on) as
select
    c.id,
    c.created_at,
    c.name,
    c.sector,
    c.size,
    c.linkedin_url,
    c.website,
    c.phone_number,
    c.address,
    c.zipcode,
    c.city,
    c.state_abbr,
    c.sales_id,
    c.context_links,
    c.country,
    c.description,
    c.revenue,
    c.tax_identifier,
    c.logo,
    c.continent,
    c.network,
    c.headcount,
    c.headcount_source,
    c.current_competitor,
    count(distinct d.id) as nb_deals,
    count(distinct co.id) as nb_contacts,
    c.is_client,
    c.is_referral,
    c.is_placeholder,
    c.referred_by_company_id,
    (
        select r.name from public.companies r
        where r.id = c.referred_by_company_id
    ) as referred_by_name,
    (
        select count(*) from public.companies rc
        where rc.referred_by_company_id = c.id
    ) as nb_referred_clients
from public.companies c
    left join public.deals d on c.id = d.company_id
    left join public.contacts co on c.id = co.company_id
group by c.id;

create or replace view public.contacts_summary with (security_invoker = on) as
select
    co.id,
    co.first_name,
    co.last_name,
    co.gender,
    co.title,
    co.background,
    co.avatar,
    co.first_seen,
    co.last_seen,
    co.has_newsletter,
    co.status,
    co.tags,
    co.company_id,
    co.sales_id,
    co.linkedin_url,
    co.email_jsonb,
    co.phone_jsonb,
    co.buyer_role,
    (jsonb_path_query_array(co.email_jsonb, '$[*]."email"'))::text as email_fts,
    (jsonb_path_query_array(co.phone_jsonb, '$[*]."number"'))::text as phone_fts,
    c.name as company_name,
    count(distinct t.id) filter (where t.done_date is null) as nb_tasks,
    c.is_placeholder as company_is_placeholder,
    c.is_client as company_is_client,
    c.is_referral as company_is_referral
from public.contacts co
    left join public.tasks t on co.id = t.contact_id
    left join public.companies c on co.company_id = c.id
group by co.id, c.id;

grant all on table public.companies_summary to anon;
grant all on table public.companies_summary to authenticated;
grant all on table public.companies_summary to service_role;

grant all on table public.contacts_summary to anon;
grant all on table public.contacts_summary to authenticated;
grant all on table public.contacts_summary to service_role;
