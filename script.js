/* =========================================================
   CONFIG — edite aqui as informações do evento
   ========================================================= */
const CONFIG = {
  // Data/hora da bola rolando, formato "AAAA-MM-DDTHH:MM:SS"
  kickoff: "2026-07-05T17:00:00",

  // Link de convite do grupo do WhatsApp (Configurações do grupo > Convidar via link)
  whatsappGroupLink: "https://chat.whatsapp.com/SEU_LINK_AQUI",
};

// Palpites da galera pro bolão. Edite/adicione conforme forem confirmando pelo grupo.
const PALPITES = [
  { nome: "Exemplo — Rafa", br: 2, no: 1 },
  { nome: "Exemplo — Maria", br: 1, no: 1 },
  { nome: "Exemplo — João", br: 3, no: 0 },
];

/* ========================================================= */

// Abre o grupo do WhatsApp (botão "Enviar no grupo" no card Bolão)
document.getElementById("btn-enviar").addEventListener("click", () => {
  window.open(CONFIG.whatsappGroupLink, "_blank");
});

/* ---------- Countdown ---------- */

function updateCountdown() {
  const target = new Date(CONFIG.kickoff).getTime();
  const now = Date.now();
  let diff = target - now;

  const label = document.getElementById("countdown-label");

  if (diff <= 0) {
    label.textContent = "é hoje, bora!";
    diff = 0;
  } else {
    label.textContent = "até a bola rolar";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById("cd-days").textContent = String(days).padStart(2, "0");
  document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("cd-min").textContent = String(mins).padStart(2, "0");
  document.getElementById("cd-sec").textContent = String(secs).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- Chips e lista de itens selecionáveis ---------- */

const selecoes = { vem: "", item: "" };

document.querySelectorAll(".chip, .food-row").forEach((el) => {
  el.addEventListener("click", () => {
    const group = el.dataset.group;
    document.querySelectorAll(`[data-group="${group}"]`).forEach((c) => c.classList.remove("selected"));
    el.classList.add("selected");
    selecoes[group] = el.dataset.value;
    checkUnlock();
  });
});

/* ---------- Validação: nome + confirmação liberam lista/bolão ---------- */

const nomeInput = document.getElementById("nome");
const btnCopiar = document.getElementById("btn-copiar");
const btnEnviarRsvp = document.getElementById("btn-enviar");
const hintLista = document.getElementById("hint-lista");
const hintBolao = document.getElementById("hint-bolao");

function checkUnlock() {
  const pronto = nomeInput.value.trim().length > 0 && selecoes.vem !== "";
  btnCopiar.disabled = !pronto;
  btnEnviarRsvp.disabled = !pronto;
  if (hintLista) hintLista.classList.toggle("visible", !pronto);
  if (hintBolao) hintBolao.classList.toggle("visible", !pronto);
}

nomeInput.addEventListener("input", checkUnlock);
checkUnlock();

/* ---------- RSVP: copiar / montar mensagem ---------- */

function montarMensagem() {
  const nome = document.getElementById("nome").value.trim() || "(sem nome)";
  const vem = selecoes.vem || "(não respondeu)";
  const item = selecoes.item || "(não respondeu)";
  const golsBr = document.getElementById("gols-br").value || "0";
  const golsNo = document.getElementById("gols-no").value || "0";

  return (
    `Confirmação — Churrasco Brasil x Noruega\n` +
    `Nome: ${nome}\n` +
    `Vou: ${vem}\n` +
    `Vou levar: ${item}\n` +
    `Palpite (bolão): Brasil ${golsBr} x ${golsNo} Noruega`
  );
}

document.getElementById("btn-copiar").addEventListener("click", async () => {
  const msg = montarMensagem();
  const feedback = document.getElementById("copy-feedback");

  try {
    await navigator.clipboard.writeText(msg);
  } catch (e) {
    // fallback pra navegadores sem suporte ao clipboard API
    const ta = document.createElement("textarea");
    ta.value = msg;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  feedback.textContent = "Copiado! Agora é só colar no grupo do WhatsApp.";
  setTimeout(() => (feedback.textContent = ""), 5000);
});

/* ---------- Placar ao vivo ---------- */

let scoreBr = 0;
let scoreNo = 0;

function renderScore() {
  document.getElementById("score-br").textContent = scoreBr;
  document.getElementById("score-no").textContent = scoreNo;
  renderRanking();
}

document.querySelectorAll(".ctrl-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const team = btn.dataset.team;
    const op = parseInt(btn.dataset.op, 10);
    if (team === "br") scoreBr = Math.max(0, scoreBr + op);
    if (team === "no") scoreNo = Math.max(0, scoreNo + op);
    renderScore();
  });
});

document.getElementById("btn-reset-placar").addEventListener("click", () => {
  scoreBr = 0;
  scoreNo = 0;
  renderScore();
});

/* ---------- Ranking do bolão ---------- */

function renderRanking() {
  const tbody = document.getElementById("ranking-body");
  tbody.innerHTML = "";

  const ranked = PALPITES.map((p) => {
    const diff = Math.abs(scoreBr - p.br) + Math.abs(scoreNo - p.no);
    return { ...p, diff };
  }).sort((a, b) => a.diff - b.diff);

  ranked.forEach((p) => {
    const tr = document.createElement("tr");
    if (p.diff === 0) tr.classList.add("winner");
    const medalIcon = p.diff === 0 ? '<i class="ti ti-medal medal-icon" aria-hidden="true"></i>' : "";
    tr.innerHTML = `
      <td class="rank-name">${medalIcon}${p.nome}</td>
      <td>${p.br} x ${p.no}</td>
      <td>${p.diff}</td>
    `;
    tbody.appendChild(tr);
  });
}

renderScore();

/* ---------- Navegação entre cards (tela única, sem scroll) ---------- */

const TOTAL_CARDS = 5;
let currentCard = 0;

const cardEls = Array.from(document.querySelectorAll(".card"));
const navLinkEls = Array.from(document.querySelectorAll(".nav-link"));
const dotEls = Array.from(document.querySelectorAll(".dot"));
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const cardCurrentEl = document.getElementById("card-current");
const counterFillEl = document.getElementById("counter-fill");
const navIndicatorEl = document.getElementById("nav-indicator");

function goToCard(index) {
  const clamped = Math.min(TOTAL_CARDS - 1, Math.max(0, index));
  currentCard = clamped;

  cardEls.forEach((c) => c.classList.toggle("active", Number(c.dataset.card) === clamped));
  navLinkEls.forEach((l) => l.classList.toggle("active", Number(l.dataset.card) === clamped));
  dotEls.forEach((d) => d.classList.toggle("active", Number(d.dataset.card) === clamped));

  if (cardCurrentEl) cardCurrentEl.textContent = String(clamped + 1).padStart(2, "0");
  if (counterFillEl) counterFillEl.style.width = `${((clamped + 1) / TOTAL_CARDS) * 100}%`;
  if (btnPrev) btnPrev.disabled = clamped === 0;
  if (btnNext) btnNext.disabled = clamped === TOTAL_CARDS - 1;

  updateBgPan();
  updateNavIndicator();
  checkUnlock();
}

/* ---------- Pílula do menu: desliza e redimensiona até o item ativo ---------- */

function updateNavIndicator() {
  if (!navIndicatorEl) return;
  const active = navLinkEls.find((l) => l.classList.contains("active"));
  if (!active) return;
  navIndicatorEl.style.width = `${active.offsetWidth}px`;
  navIndicatorEl.style.transform = `translateX(${active.offsetLeft}px)`;
}

window.addEventListener("resize", updateNavIndicator);
window.addEventListener("load", updateNavIndicator);

/* ---------- Fundo panorâmico contínuo: desliza junto com o card ---------- */

const stageBg = document.getElementById("stage-bg");

function updateBgPan() {
  if (!stageBg) return;
  const maxShift = Math.max(0, stageBg.offsetWidth - window.innerWidth);
  const shift = (currentCard / (TOTAL_CARDS - 1)) * maxShift;
  stageBg.style.transform = `translateX(-${shift}px)`;
}

if (stageBg) {
  if (stageBg.complete) updateBgPan();
  stageBg.addEventListener("load", updateBgPan);
  window.addEventListener("resize", updateBgPan);
}

navLinkEls.forEach((link) => {
  link.addEventListener("click", () => goToCard(Number(link.dataset.card)));
});

dotEls.forEach((dot) => {
  dot.addEventListener("click", () => goToCard(Number(dot.dataset.card)));
});

document.querySelectorAll(".card-next-btn").forEach((btn) => {
  btn.addEventListener("click", () => goToCard(Number(btn.dataset.goto)));
});

if (btnPrev) btnPrev.addEventListener("click", () => goToCard(currentCard - 1));
if (btnNext) btnNext.addEventListener("click", () => goToCard(currentCard + 1));

document.addEventListener("keydown", (e) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key === "ArrowRight") goToCard(currentCard + 1);
  if (e.key === "ArrowLeft") goToCard(currentCard - 1);
});

// Swipe (mobile) no deck de cards
const cardDeckEl = document.querySelector(".card-deck");
if (cardDeckEl) {
  let touchStartX = 0;
  let touchStartY = 0;

  cardDeckEl.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  cardDeckEl.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) goToCard(currentCard + 1);
        else goToCard(currentCard - 1);
      }
    },
    { passive: true }
  );
}

goToCard(0);
