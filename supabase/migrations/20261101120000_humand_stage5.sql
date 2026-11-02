-- Humand stage 5: company sites, tasks on deals, meeting invites.
-- 1. Companies list their sites ("Sedes") in a jsonb array. The old address
--    columns are kept; their data becomes a first site "Sede principal".
-- 2. Tasks belong to deals: tasks.deal_id, contact_id becomes optional, and
--    existing tasks are linked to the active deal of their contact's company.
-- 3. Demo and meeting tasks keep their guests (attendees) and the Google Meet
--    link of their calendar event (meet_url, written by the calendar sync).
-- 4. The "lunch" task type is retired: lunch tasks become meetings.
-- 5. A company has at most one active (non-archived) deal.

-- 1. Company sites: [{name, country, address, city, state}]
alter table public.companies add column if not exists sites jsonb not null default '[]'::jsonb;

-- The logo trigger is disabled meanwhile: it would query the favicon of
-- every updated company without a logo.
alter table public.companies disable trigger company_saved;

update public.companies
set sites = jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
    'name', 'Sede principal',
    'country', nullif(btrim(country), ''),
    'address', nullif(btrim(address), ''),
    'city', nullif(btrim(city), ''),
    'state', nullif(btrim(state_abbr), '')
)))
where sites = '[]'::jsonb
    and (
        coalesce(btrim(country), '') <> ''
        or coalesce(btrim(address), '') <> ''
        or coalesce(btrim(city), '') <> ''
        or coalesce(btrim(state_abbr), '') <> ''
    );

alter table public.companies enable trigger company_saved;

-- companies_summary lists its columns explicitly: sites is appended
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
    ) as nb_referred_clients,
    c.sites
from public.companies c
    left join public.deals d on c.id = d.company_id
    left join public.contacts co on c.id = co.company_id
group by c.id;

-- 5. One active deal per company. Checked before the index so that a
-- duplicate stops the migration with the companies to fix.
do $$
declare
  duplicates text;
begin
  select string_agg(format('company %s (%s active deals)', company_id, n), ', ')
  into duplicates
  from (
    select company_id, count(*) as n
    from public.deals
    where archived_at is null and company_id is not null
    group by company_id
    having count(*) > 1
  ) dup;

  if duplicates is not null then
    raise exception 'Companies with more than one active deal: %. Archive the extra deals, then run this migration again.', duplicates;
  end if;
end;
$$;

create unique index if not exists deals_company_id_active_unique_idx
    on public.deals using btree (company_id) where archived_at is null;

-- 2. Tasks belong to deals
alter table public.tasks add column if not exists deal_id bigint;
alter table public.tasks alter column contact_id drop not null;

alter table public.tasks drop constraint if exists tasks_deal_id_fkey;
alter table public.tasks
    add constraint tasks_deal_id_fkey foreign key (deal_id) references public.deals(id) on delete cascade;

create index if not exists tasks_deal_id_idx on public.tasks using btree (deal_id);

-- Existing tasks: the active deal of the company of their contact
update public.tasks t
set deal_id = d.id
from public.contacts co
    join public.deals d on d.company_id = co.company_id and d.archived_at is null
where t.contact_id = co.id
    and t.deal_id is null;

alter table public.tasks drop constraint if exists tasks_deal_or_contact_check;
alter table public.tasks
    add constraint tasks_deal_or_contact_check check (deal_id is not null or contact_id is not null);

-- 3. Meeting guests and Google Meet link
alter table public.tasks add column if not exists attendees jsonb not null default '[]'::jsonb;
alter table public.tasks add column if not exists meet_url text;

-- 4. No more lunch tasks
update public.tasks set type = 'meeting' where type = 'lunch';

update public.configuration
set config = jsonb_set(
    config,
    '{taskTypes}',
    coalesce(
        (
            select jsonb_agg(task_type)
            from jsonb_array_elements(config->'taskTypes') task_type
            where task_type->>'value' <> 'lunch'
        ),
        '[]'::jsonb
    )
)
where jsonb_typeof(config->'taskTypes') = 'array'
    and config->'taskTypes' @> '[{"value": "lunch"}]'::jsonb;
