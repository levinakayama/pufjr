# pufjr

Site pra organizar o churrasco da Copa do Mundo 2026 — Brasil x Noruega.

HTML, CSS e JavaScript puro, sem servidor. Confirmação de presença, lista do que cada um leva, bolão e placar ao vivo.

## Como usar

Abra o `index.html` no navegador (celular ou computador). Não precisa instalar nada.

Para compartilhar um link com o grupo, suba a pasta em qualquer hospedagem estática gratuita (Netlify, Vercel, GitHub Pages).

## Estrutura

```
PUFJr/
├── index.html    # markup dos 5 cards
├── style.css     # layout, moldura estilo figurinha, responsivo
├── script.js     # navegação, RSVP, bolão, placar e config
├── .env.example  # template de variáveis (copie para .env)
└── README.md
```

## Cards

O site é uma tela fixa com foto panorâmica de fundo e 5 cards navegáveis (setas, swipe, menu ou teclado):

1. **Informações** — data, horário, endereço, botão "Ver no mapa"
2. **Confirmar presença (RSVP)** — nome + confirmação
3. **Lista** — o que cada um vai trazer
4. **Bolão** — palpite do placar, copiar/enviar no WhatsApp e ranking
5. **Placar ao vivo** — contador local de gols (não sincroniza entre aparelhos)

Sem preencher o RSVP, os cards Lista e Bolão ficam bloqueados.

## Configuração

Edite o topo do `script.js`:

```js
const CONFIG = {
  kickoff: "2026-07-05T17:00:00",
  whatsappGroupLink: "https://chat.whatsapp.com/SEU_LINK_AQUI",
};

const PALPITES = [
  { nome: "Rafa", br: 2, no: 1 },
  // adicione um objeto por palpite recebido no grupo
];
```

- **`whatsappGroupLink`**: link de convite do grupo (WhatsApp → Grupo → Convidar via link)
- **`PALPITES`**: atualize conforme a galera manda palpites; o ranking recalcula com o placar ao vivo

## Lista de itens

Itens ficam no `index.html`, dentro de `#card-lista` → `.food-list`. Cada item é um `<button class="food-row" data-value="..." data-group="item">`.

## Como funciona sem servidor

- **RSVP / lista / bolão**: a pessoa preenche e copia a confirmação para colar no WhatsApp. Quem organiza atualiza `PALPITES` manualmente.
- **Placar ao vivo**: funciona só no aparelho aberto (ideal para TV/telão durante o jogo).
- **Ranking**: calculado localmente com base no placar daquele aparelho.

## Evento

**Casa do Rafa** — Rua Jaú, 77, Baeta Neves, São Bernardo do Campo/SP  
Chegada: 13h · Jogo: 17h (domingo)
