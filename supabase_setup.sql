-- =========================================================
-- Churrasco da Grande Final — setup do Supabase
-- Rode este arquivo inteiro em: seu projeto Supabase > SQL Editor > New query > Run
-- Pode rodar de novo sem problema (idempotente) — só note que o TRUNCATE
-- abaixo apaga qualquer item já marcado. Como a lista ainda não carregou
-- pra ninguém, é seguro rodar agora.
-- =========================================================

create table if not exists public.items (
  id bigint generated always as identity primary key,
  category text not null,
  name text not null,
  sort_order int not null default 0,
  claimed_by text,
  claimed_at timestamptz
);

alter table public.items enable row level security;

-- Qualquer pessoa com o link do site pode ver e marcar itens (sem login).
-- Combina com um grupo fechado de amigos; não use isso pra algo público/sensível.
drop policy if exists "Anyone can read items" on public.items;
create policy "Anyone can read items"
  on public.items for select
  using (true);

drop policy if exists "Anyone can update items" on public.items;
create policy "Anyone can update items"
  on public.items for update
  using (true)
  with check (true);

-- Habilita o "tempo real" (pra lista atualizar sozinha em todos os celulares).
-- Se já tinha rodado antes, isso evita erro de "já existe".
do $$
begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then
  null;
end $$;

-- =========================================================
-- Lista de itens (curada em 12/07, v2) — combos ajustados.
-- Edite livremente depois pelo painel Supabase > Table Editor,
-- sem precisar mexer em SQL de novo.
-- =========================================================
truncate table public.items restart identity;

insert into public.items (category, name, sort_order) values
  ('Carnes', '2 pacotes de espetinho de carne (bovino)', 1),
  ('Carnes', '2 pacotes de espetinho de carne (bovino)', 2),
  ('Carnes', '2 pacotes de espetinho de carne (bovino)', 3),
  ('Carnes', '2 pacotes de espetinho de carne (bovino)', 4),
  ('Carnes', '2 pacotes de espetinho de frango', 5),
  ('Queijos', '2 pacotes de queijo coalho + 1 pacote de linguiça', 1),
  ('Bebidas', '3x Coca Zero 2L + 4x água sem gás', 1),
  ('Bebidas', '2x Coca Zero 2L + 2x suco ou chá', 2),
  ('Bebidas', '2x Coca normal 2L + 4x água com gás', 3),
  ('Bebidas', '2x Guaraná 2L + 2x suco ou chá', 4),
  ('Estrutura', 'Descartáveis: prato + copo + talher (30un)', 1),
  ('Estrutura', '10kg de carvão + acendedor de carvão', 2),
  ('Acompanhamento', 'Guardanapo + papel toalha + farofa pronta + copo térmico', 1),
  ('Acompanhamento', 'Vinagrete + salada + 1 pacote de espetinho de carne', 2),
  ('Acompanhamento', 'Maionese + arroz + 1 pacote de espetinho de carne', 3),
  ('Acompanhamento', '3 pacotes de pão de alho + panceta', 4),
  ('Sobremesa', 'Sobremesa 1', 1),
  ('Sobremesa', 'Sobremesa 2', 2),
  ('Sobremesa', 'Sobremesa 3', 3),
  ('Café', 'Máquina de Nespresso + 2 caixas de cápsulas', 1);
