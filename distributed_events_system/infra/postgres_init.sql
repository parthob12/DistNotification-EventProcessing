create table if not exists events (
  id uuid primary key,
  type text not null,
  payload jsonb not null,
  source text,
  created_at timestamptz default now()
);

create table if not exists event_processing (
  event_id uuid primary key references events(id),
  status text not null,
  attempt_count int not null default 0,
  last_error text,
  updated_at timestamptz default now()
);
