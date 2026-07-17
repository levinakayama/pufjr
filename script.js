/* =========================================================
   CONFIG — edite aqui as informações do evento
   ========================================================= */
const CONFIG = {
  // Data/hora da bola rolando (final), formato "AAAA-MM-DDTHH:MM:SS" (horário de Brasília)
  kickoff: "2026-07-19T16:00:00",

  // Credenciais do Supabase (projeto > Settings > API). A "anon/publishable key" é pública,
  // protegida por Row Level Security — não é segredo, pode ficar no código do site.
  supabaseUrl: "https://ilibvwyupjyblxiwdfvx.supabase.co",
  supabaseAnonKey: "sb_publishable_9dc-_7X49jRkr6nZ-prEMg_Fjej0Gsj",
};

/* ========================================================= */

/* ---------- Countdown ---------- */

function updateCountdown() {
  const target = new Date(CONFIG.kickoff).getTime();
  const now = Date.now();
  let diff = target - now;

  if (diff <= 0) {
    diff = 0;
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

/* ---------- Lista de itens compartilhada (Supabase) ---------- */

const nomeInput = document.getElementById("nome");
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

  const nome = nomeInput ? nomeInput.value.trim() : "";
  if (!nome) {
    alert("Coloca seu nome antes de escolher um item.");
    if (nomeInput) nomeInput.focus();
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
}

/* ---------- Música ambiente ---------- */

const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let musicPlaying = false;

function setMusicUi(playing) {
  musicPlaying = playing;
  if (!musicToggle) return;
  musicToggle.innerHTML = playing
    ? '<i class="ti ti-music" aria-hidden="true"></i>'
    : '<i class="ti ti-music-off" aria-hidden="true"></i>';
  musicToggle.classList.toggle("playing", playing);
  musicToggle.setAttribute("aria-label", playing ? "Pausar música ambiente" : "Tocar música ambiente");
}

if (musicToggle && bgMusic) {
  musicToggle.addEventListener("click", () => {
    if (musicPlaying) {
      bgMusic.pause();
      setMusicUi(false);
      return;
    }
    bgMusic.volume = 0.4;
    bgMusic
      .play()
      .then(() => setMusicUi(true))
      .catch(() => setMusicUi(false));
  });
}

/* ---------- Navegação entre cards (tela única, sem scroll) ---------- */

const TOTAL_CARDS = 2;
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

/* ---------- Teoria (bandeira da Espanha) ---------- */

(function setupTeoriaModal() {
  const btn = document.getElementById("btn-teoria");
  const modal = document.getElementById("teoria-modal");
  if (!btn || !modal) return;

  function openTeoria() {
    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeTeoria() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  btn.addEventListener("click", openTeoria);
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-teoria]")) closeTeoria();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeTeoria();
  });
})();

