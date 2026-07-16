# Churrasco da Grande Final

Site simples (HTML/CSS/JS, sem servidor próprio) pra organizar o churrasco: confirmação de presença, pagamento do rateio via Pix e lista de itens compartilhada (via Supabase).

## Como usar

Abra o `index.html` no navegador (celular ou computador). Não precisa instalar nada — mas a lista de itens (card 3) só funciona depois de configurar o Supabase (veja abaixo).

Pra hospedar num link (pra mandar pro grupo), suba a pasta pro GitHub e depois importe no Vercel — já configuramos isso junto.

## Design: tela única com 3 cards navegáveis

O site é uma tela fixa (não rola), com uma foto de fundo panorâmica que desliza conforme você troca de card, e um menu com pílula verde animada no topo. Os 3 cards, em ordem:

1. **Informações** — data (19/07), horário, endereço, final Argentina × Espanha.
2. **RSVP + Pix** — nome, "vai vir?", chave Pix do rateio (R$ 20) e um botão "já paguei". Só depois de confirmar presença como "Sim" **e** marcar o Pix como pago é que libera o acesso à lista.
3. **Lista** — itens do churrasco, compartilhados em tempo real entre todo mundo (Supabase). Cada pessoa toca num item pra marcar que vai levar; some pra todo mundo na hora.

## Configuração obrigatória: Supabase (lista de itens)

A lista de itens (card 3) precisa de um banco de dados pra funcionar entre ~20-30 pessoas ao mesmo tempo — sem isso, cada celular veria uma lista separada, o que não serve pro objetivo (saber quem já pegou o quê).

Passo a passo:

1. Já criamos as credenciais do projeto Supabase (`ilibvwyupjyblxiwdfvx`) e elas já estão preenchidas em `CONFIG.supabaseUrl` / `CONFIG.supabaseAnonKey`, no topo do `script.js`. A "publishable/anon key" é pública por design (protegida por Row Level Security) — não é segredo, por isso pode ficar no código do site.
2. Entra no painel do Supabase (supabase.com) desse projeto → **SQL Editor** → **New query**.
3. Cola o conteúdo inteiro do arquivo `supabase_setup.sql` (está na pasta do projeto) e clica em **Run**. Isso cria a tabela `items`, libera leitura/escrita pública (sem login — combina com um grupo fechado de amigos) e já popula a lista inicial de itens.
4. Pronto — abre o site, vai no card Lista, e os itens devem aparecer. Teste marcando um item em duas abas diferentes pra confirmar que atualiza sozinho nas duas.

Se quiser adicionar, remover ou renomear itens depois, edite direto na tabela `items` pelo painel do Supabase (aba **Table Editor**) — não precisa mexer no código.

⚠️ Importante: como não tem login, qualquer pessoa com o link do site consegue ver e marcar itens. Está OK pra uso entre amigos, mas não divulgue o link publicamente.

## O que editar

Tudo fica centralizado no topo do arquivo `script.js`:

```js
const CONFIG = {
  kickoff: "2026-07-19T16:00:00",   // data/hora da final, horário de Brasília (usado no contador)
  pixKeyDisplay: "...",  // o que aparece na tela
  pixKeyCopy: "...",     // o que é copiado ao clicar em "Copiar"
  supabaseUrl: "https://ilibvwyupjyblxiwdfvx.supabase.co",
  supabaseAnonKey: "sb_publishable_...",
};
```

- **`kickoff`**: horário oficial da final é 15h (horário do estádio, em Nova Jersey/EUA) — convertido pra horário de Brasília dá **16h**. Ajuste se a FIFA mudar o horário.
- **`pixKeyDisplay` / `pixKeyCopy`**: chave Pix mostrada e copiada no card RSVP — edite no `script.js` (não coloque valores reais no README).

## Fluxo de RSVP + Pix (card 2)

1. Pessoa preenche nome e marca "Sim, com certeza" → aparece a caixa do Pix.
2. Copia a chave Pix (botão "Copiar") e faz o pagamento de R$ 20 (rateio do salão de festas) por fora do site.
3. Clica em "Já fiz o Pix de R$ 20,00" pra confirmar.
4. Só então libera o acesso à Lista.

Não existe verificação automática do pagamento (o site não tem acesso à sua conta bancária) — é um sistema de honra, como o "rateio" de qualquer churrasco entre amigos.

## Música ambiente

Tem um botão flutuante no canto superior direito (ícone de nota musical) que toca a faixa em loop, com volume baixo. Fica desligada por padrão — todo navegador bloqueia som automático sem interação, então o primeiro clique já liga e também funciona como play/pause.

Pra trocar a música, troque o `src` do elemento `<audio id="bg-music">` no `index.html`.

## Fundo panorâmico contínuo

O fundo (`<img class="stage-bg" id="stage-bg">`) é uma foto bem larga, dimensionada só pela altura, que "vazou" pros lados da tela — o `script.js` desliza ela horizontalmente conforme você troca de card (`updateBgPan()`), dando a sensação de ser uma única imagem contínua.

## Moldura dos cards (estilo figurinha)

Cada card tem uma faixa superior (`.card-header`) com manchas orgânicas coloridas (`.card-blob`) e um escudo circular de bandeira (`.card-flag`). Layout original, sem logos da FIFA/Panini.

## Endereço

Casa do Fê Paiva — Alameda dos Arapanés, 178
Chegada: 13h · Final: 16h (horário de Brasília), domingo 19/07
