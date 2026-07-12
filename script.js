/* =========================================================
   CONFIG — edite aqui as informações do evento
   ========================================================= */
const CONFIG = {
  // Data/hora da bola rolando (final), formato "AAAA-MM-DDTHH:MM:SS" (horário de Brasília)
  kickoff: "2026-07-19T16:00:00",

  // Link de convite do grupo do WhatsApp (Configurações do grupo > Convidar via link)
  whatsappGroupLink: "https://chat.whatsapp.com/L2fKSzdX2zdFamIN80Ixfh",

  // Chave Pix mostrada no card RSVP (só o que aparece na tela; a cópia usa só os números)
  pixKeyDisplay: "11 99522-2220 · Levi",
  pixKeyCopy: "11995222220",

  // Credenciais do Supabase (projeto > Settings > API). A "anon/publishable key" é pública,
  // protegida por Row Level Security — não é segredo, pode ficar no código do site.
  supabaseUrl: "https://ilibvwyupjyblxiwdfvx.supabase.co",
  supabaseAnonKey: "sb_publishable_9dc-_7X49jRkr6nZ-prEMg_Fjej0Gsj",
};

/* ========================================================= */

// Link do grupo (botão "Entrar no grupo" no card RSVP, só fica clicável quando libera)
const linkGrupoEl = document.getElementById("link-grupo");
if (linkGrupoEl) linkGrupoEl.href = CONFIG.whatsappGroupLink;

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
    label.textContent = "até a grande final";
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

/* ---------- Chips (vem) ---------- */

const selecoes = { vem: "" };

document.querySelectorAll(".chip").forEach((el) => {
  el.addEventListener("click", () => {
    const group = el.dataset.group;
    document.querySelectorAll(`[data-group="${group}"]`).forEach((c) => c.classList.remove("selected"));
    el.classList.add("selected");
    selecoes[group] = el.dataset.value;
    checkUnlock();
  });
});

/* ---------- Pix: copiar chave + confirmar pagamento ---------- */

const pixKeySpan = document.querySelector("#pix-box .pix-key-info span");
if (pixKeySpan) pixKeySpan.textContent = CONFIG.pixKeyDisplay;

async function copiarPixKey(btn) {
  if (!btn) return;
  const original = btn.innerHTML;
  try {
    await navigator.clipboard.writeText(CONFIG.pixKeyCopy);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = CONFIG.pixKeyCopy;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Copiado!';
  setTimeout(() => (btn.innerHTML = original), 2000);
}

document.getElementById("btn-copiar-pix")?.addEventListener("click", (e) => {
  copiarPixKey(e.currentTarget);
});

document.getElementById("btn-copiar-pix-bolao")?.addEventListener("click", (e) => {
  copiarPixKey(e.currentTarget);
});

const pixBolaoDisplay = document.getElementById("pix-bolao-display");
if (pixBolaoDisplay) pixBolaoDisplay.textContent = CONFIG.pixKeyDisplay;

let pago = false;
const chipPago = document.getElementById("chip-pago");
chipPago.addEventListener("click", () => {
  pago = !pago;
  chipPago.classList.toggle("selected", pago);
  chipPago.innerHTML = pago
    ? '<i class="ti ti-check" aria-hidden="true"></i> Pix confirmado'
    : '<i class="ti ti-checkbox" aria-hidden="true"></i> Já fiz o Pix de R$ 20,00';
  checkUnlock();
});

/* ---------- Validação: nome + "Sim" + Pix liberam grupo/lista/bolão ---------- */

const nomeInput = document.getElementById("nome");
const btnCopiar = document.getElementById("btn-copiar");
const pixBox = document.getElementById("pix-box");
const hintPix = document.getElementById("hint-pix");
const unlockActions = document.getElementById("unlock-actions");
const hintLista = document.getElementById("hint-lista");
const hintBolao = document.getElementById("hint-bolao");
const palpiteScores = { time1: null, time2: null };

function isUnlocked() {
  return selecoes.vem === "Sim, com certeza!" && pago && nomeInput.value.trim().length > 0;
}

function updateConfirmButtonLabel() {
  if (!btnCopiar) return;
  const placarPronto = palpiteScores.time1 !== null && palpiteScores.time2 !== null;
  btnCopiar.innerHTML = placarPronto
    ? '<i class="ti ti-check" aria-hidden="true"></i> Confirmar palpite'
    : '<i class="ti ti-ball-football" aria-hidden="true"></i> Escolhe o placar';
}

function setScorePickersEnabled(enabled) {
  document.querySelectorAll(".palpite-score").forEach((btn) => {
    btn.disabled = !enabled;
    btn.setAttribute("aria-disabled", enabled ? "false" : "true");
  });
}

function checkUnlock() {
  const confirmouPresenca = selecoes.vem === "Sim, com certeza!";
  if (pixBox) pixBox.classList.toggle("visible", confirmouPresenca);

  const pronto = isUnlocked();
  const placarPronto = palpiteScores.time1 !== null && palpiteScores.time2 !== null;

  if (hintPix) hintPix.classList.toggle("visible", !pronto);
  if (unlockActions) unlockActions.classList.toggle("visible", pronto);
  if (btnCopiar) btnCopiar.disabled = !(pronto && placarPronto);
  if (hintLista) hintLista.classList.toggle("visible", !pronto);
  if (hintBolao) hintBolao.classList.toggle("visible", !pronto);
  setScorePickersEnabled(pronto);
  updateConfirmButtonLabel();
}

nomeInput.addEventListener("input", checkUnlock);
checkUnlock();

/* ---------- Bolão: modal de placar + confirmar palpite ---------- */

const scoreModal = document.getElementById("score-modal");
const scoreModalTitle = document.getElementById("score-modal-title");
const scoreModalGrid = document.getElementById("score-modal-grid");
const palpitesListEl = document.getElementById("palpites-list");
let scoreModalTarget = null;
let palpitesCache = [];

function buildScoreGrid() {
  scoreModalGrid.innerHTML = "";
  for (let n = 0; n <= 10; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "score-pick";
    btn.textContent = String(n);
    btn.dataset.value = String(n);
    scoreModalGrid.appendChild(btn);
  }
}

function openScoreModal(team) {
  if (!isUnlocked()) return;
  scoreModalTarget = team;
  const label = team === "time1" ? "Time 1" : "Time 2";
  scoreModalTitle.textContent = `Gols — ${label}`;
  const current = palpiteScores[team];
  scoreModalGrid.querySelectorAll(".score-pick").forEach((btn) => {
    btn.classList.toggle("selected", current !== null && btn.dataset.value === String(current));
  });
  scoreModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeScoreModal() {
  scoreModal.hidden = true;
  scoreModalTarget = null;
  document.body.classList.remove("modal-open");
}

function setPalpiteScore(team, value) {
  palpiteScores[team] = value;
  const btn = document.getElementById(team === "time1" ? "gols-time1" : "gols-time2");
  if (btn) {
    btn.textContent = String(value);
    btn.classList.add("filled");
  }
  checkUnlock();
}

buildScoreGrid();

document.querySelectorAll(".palpite-score").forEach((btn) => {
  btn.addEventListener("click", () => openScoreModal(btn.dataset.team));
});

scoreModalGrid.addEventListener("click", (e) => {
  const pick = e.target.closest(".score-pick");
  if (!pick || !scoreModalTarget) return;
  setPalpiteScore(scoreModalTarget, Number(pick.dataset.value));
  closeScoreModal();
});

scoreModal.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]")) closeScoreModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !scoreModal.hidden) closeScoreModal();
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPalpites() {
  if (!palpitesListEl) return;

  if (!palpitesCache.length) {
    palpitesListEl.innerHTML =
      '<p class="card-hint">Ninguém chutou ainda — confirma o seu pra aparecer aqui.</p>';
    return;
  }

  const groupsMap = new Map();
  palpitesCache.forEach((p) => {
    const key = `${p.gols_time1}x${p.gols_time2}`;
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        gols1: p.gols_time1,
        gols2: p.gols_time2,
        nomes: [],
      });
    }
    groupsMap.get(key).nomes.push(p.nome);
  });

  const groups = [...groupsMap.values()].sort((a, b) => {
    if (b.nomes.length !== a.nomes.length) return b.nomes.length - a.nomes.length;
    if (a.gols1 !== b.gols1) return a.gols1 - b.gols1;
    return a.gols2 - b.gols2;
  });

  palpitesListEl.innerHTML = groups
    .map((group) => {
      const count = group.nomes.length;
      const label = count === 1 ? "1 pessoa" : `${count} pessoas`;
      return `
        <div class="palpite-group">
          <div class="palpite-group-score">
            <span class="palpite-group-placar">${group.gols1} × ${group.gols2}</span>
            <span class="palpite-group-count">${label}</span>
          </div>
          <p class="palpite-group-names">${group.nomes.map(escapeHtml).join(", ")}</p>
        </div>
      `;
    })
    .join("");
}

async function loadPalpites() {
  if (!palpitesListEl) return;
  if (!supabaseClient) {
    palpitesListEl.innerHTML =
      '<p class="card-hint">Bolão ainda não conectado ao Supabase.</p>';
    return;
  }

  const { data, error } = await supabaseClient
    .from("palpites")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    palpitesListEl.innerHTML =
      '<p class="card-hint">Não consegui carregar os palpites. Roda o <code>supabase_palpites.sql</code> no Supabase se ainda não rodou.</p>';
    return;
  }

  palpitesCache = data || [];
  renderPalpites();
}

async function confirmarPalpite() {
  const feedback = document.getElementById("copy-feedback");
  const nome = nomeInput.value.trim();
  const gols1 = palpiteScores.time1;
  const gols2 = palpiteScores.time2;

  if (!nome || gols1 === null || gols2 === null) return;

  if (!supabaseClient) {
    feedback.textContent = "Supabase não conectado — não deu pra salvar.";
    return;
  }

  btnCopiar.disabled = true;
  feedback.textContent = "Salvando…";

  const payload = {
    nome,
    gols_time1: gols1,
    gols_time2: gols2,
    updated_at: new Date().toISOString(),
  };

  const existing = palpitesCache.find(
    (p) => p.nome.trim().toLowerCase() === nome.toLowerCase()
  );

  let error;
  if (existing) {
    ({ error } = await supabaseClient.from("palpites").update(payload).eq("id", existing.id));
  } else {
    ({ error } = await supabaseClient.from("palpites").insert(payload));
  }

  if (error) {
    console.error(error);
    feedback.textContent = "Não deu pra salvar. Tenta de novo.";
    checkUnlock();
    return;
  }

  feedback.textContent = "Palpite confirmado!";
  setTimeout(() => (feedback.textContent = ""), 4000);
  await loadPalpites();
  checkUnlock();
}

document.getElementById("btn-copiar").addEventListener("click", confirmarPalpite);

/* ---------- Lista de itens compartilhada (Supabase) ---------- */

const foodListEl = document.getElementById("food-list");
let supabaseClient = null;
let itemsCache = [];

if (
  window.supabase &&
  CONFIG.supabaseUrl &&
  CONFIG.supabaseAnonKey &&
  !CONFIG.supabaseUrl.includes("SEU_")
) {
  supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
}

function renderFoodList() {
  if (!foodListEl) return;

  if (!itemsCache.length) {
    foodListEl.innerHTML = '<p class="card-hint">Nenhum item cadastrado ainda.</p>';
    return;
  }

  const groups = [];
  const groupIndex = {};
  itemsCache.forEach((item) => {
    if (!(item.category in groupIndex)) {
      groupIndex[item.category] = groups.length;
      groups.push({ category: item.category, items: [] });
    }
    groups[groupIndex[item.category]].items.push(item);
  });

  foodListEl.innerHTML = groups
    .map(
      (group) => `
        <div class="food-group">
          <p class="food-group-label">${group.category}</p>
          <div class="food-items">
            ${group.items
              .map(
                (item) => `
                  <button type="button" class="food-row ${item.claimed_by ? "claimed" : ""}" data-id="${item.id}">
                    <span>${item.name}</span>
                    ${
                      item.claimed_by
                        ? `<span class="food-claimed-by"><i class="ti ti-check food-check" aria-hidden="true"></i>${item.claimed_by}</span>`
                        : `<i class="ti ti-circle-plus food-check" aria-hidden="true"></i>`
                    }
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");

  foodListEl.querySelectorAll(".food-row").forEach((btn) => {
    btn.addEventListener("click", () => onItemClick(Number(btn.dataset.id)));
  });
}

async function loadItems() {
  if (!foodListEl) return;
  if (!supabaseClient) {
    foodListEl.innerHTML =
      '<p class="card-hint">Lista ainda não conectada ao Supabase. Preenche CONFIG.supabaseUrl / supabaseAnonKey no script.js (veja o README).</p>';
    return;
  }
  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    foodListEl.innerHTML = '<p class="card-hint">Não consegui carregar a lista agora. Recarrega a página.</p>';
    console.error(error);
    return;
  }
  itemsCache = data || [];
  renderFoodList();
}

async function onItemClick(id) {
  const item = itemsCache.find((i) => i.id === id);
  if (!item || !supabaseClient) return;

  if (!isUnlocked()) {
    alert("Confirma presença e o Pix no card RSVP antes de escolher um item.");
    return;
  }

  const nome = nomeInput.value.trim();
  if (!nome) {
    alert("Preenche seu nome no card RSVP antes de escolher um item.");
    return;
  }

  if (item.claimed_by) {
    if (item.claimed_by !== nome) return; // já é de outra pessoa, ignora o clique
    if (!confirm(`Liberar "${item.name}"? Você tinha marcado que ia trazer.`)) return;
    const { error } = await supabaseClient
      .from("items")
      .update({ claimed_by: null, claimed_at: null })
      .eq("id", id);
    if (error) console.error(error);
    return;
  }

  if (!confirm(`Confirma que você, ${nome}, vai levar "${item.name}"?`)) return;

  const { data, error } = await supabaseClient
    .from("items")
    .update({ claimed_by: nome, claimed_at: new Date().toISOString() })
    .eq("id", id)
    .is("claimed_by", null)
    .select();

  if (error) {
    console.error(error);
    return;
  }
  if (!data || data.length === 0) {
    alert("Ops, alguém acabou de pegar esse item. Atualizando a lista…");
    loadItems();
  }
}

loadItems();

if (supabaseClient) {
  supabaseClient
    .channel("items-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => loadItems())
    .subscribe();

  loadPalpites();
  supabaseClient
    .channel("palpites-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "palpites" }, () => loadPalpites())
    .subscribe();
} else {
  loadPalpites();
}

/* ---------- Música ambiente ---------- */

const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let musicPlaying = false;

if (musicToggle && bgMusic) {
  musicToggle.addEventListener("click", () => {
    musicPlaying = !musicPlaying;
    if (musicPlaying) {
      bgMusic.volume = 0.35;
      bgMusic.play().catch(() => {
        musicPlaying = false;
      });
      musicToggle.innerHTML = '<i class="ti ti-music" aria-hidden="true"></i>';
      musicToggle.classList.add("playing");
    } else {
      bgMusic.pause();
      musicToggle.innerHTML = '<i class="ti ti-music-off" aria-hidden="true"></i>';
      musicToggle.classList.remove("playing");
    }
  });
}

/* ---------- Navegação entre cards (tela única, sem scroll) ---------- */

const TOTAL_CARDS = 4;
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
