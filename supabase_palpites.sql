-- =========================================================
-- Bolão — tabela de palpites (rode no SQL Editor do Supabase)
-- Seguro rodar em projeto que já tem a tabela items.
-- =========================================================

create table if not exists public.palpites (
  id bigint generated always as identity primary key,
  nome text not null,
  gols_time1 int not null check (gols_time1 between 0 and 10),
  gols_time2 int not null check (gols_time2 between 0 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Um palpite por nome (se a pessoa confirmar de novo, atualiza o placar)
create unique index if not exists palpites_nome_unique
  on public.palpites (lower(trim(nome)));

alter table public.palpites enable row level security;

drop policy if exists "Anyone can read palpites" on public.palpites;
create policy "Anyone can read palpites"
  on public.palpites for select
  using (true);

drop policy if exists "Anyone can insert palpites" on public.palpites;
create policy "Anyone can insert palpites"
  on public.palpites for insert
  with check (true);

drop policy if exists "Anyone can update palpites" on public.palpites;
create policy "Anyone can update palpites"
  on public.palpites for update
  using (true)
  with check (true);

drop policy if exists "Anyone can delete palpites" on public.palpites;
create policy "Anyone can delete palpites"
  on public.palpites for delete
  using (true);

do $$
begin
  alter publication supabase_realtime add table public.palpites;
exception when duplicate_object then
  null;
end $$;

-- Zerar lista de palpites (rode quando quiser resetar):
-- truncate public.palpites restart identity;
