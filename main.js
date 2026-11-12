import { WORDS } from "./words.js";

const MAX_ERRORS = 6;
const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];
const ALPHABET = new Set(KEY_ROWS.join(""));
const STATS_KEY = "ahorcado:stats";
const DRAWING_ALTS = [
  "Horca vacía",
  "Aparece la cabeza",
  "Aparece el cuerpo",
  "Aparece un brazo",
  "Aparecen los dos brazos",
  "Aparece una pierna",
  "Dibujo completo: ahorcado",
];

const $ = (id) => document.getElementById(id);
const el = {
  date: $("date"),
  gallows: $("gallows"),
  drawing: $("drawing"),
  hint: $("hint"),
  word: $("word"),
  tally: $("tally"),
  livesText: $("livesText"),
  result: $("result"),
  verdict: $("verdict"),
  next: $("next"),
  keyboard: $("keyboard"),
  score: $("score"),
  live: $("live"),
};

/** Strips accents (Á→A, Ü→U) but keeps Ñ, which is its own letter in Spanish. */
function normalizeLetter(ch) {
  const upper = ch.toUpperCase();
  if (upper === "Ñ") return "Ñ";
  return upper.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* ---------- Word bag: no repeats until every word has been played ---------- */

const uniqueWords = [...new Set(WORDS.map((w) => w.trim().toUpperCase()))].filter(Boolean);
let bag = [];
let lastWord = "";

function drawWord() {
  if (bag.length === 0) {
    bag = shuffle([...uniqueWords]);
    if (bag.length > 1 && bag[bag.length - 1] === lastWord) bag.unshift(bag.pop());
  }
  lastWord = bag.pop();
  return lastWord;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/* ---------- Stats (best effort: the game works without storage) ---------- */

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY));
    if (saved && typeof saved.wins === "number") return saved;
  } catch {}
  return { wins: 0, losses: 0, streak: 0, best: 0 };
}

function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

/* ---------- State ---------- */

const stats = loadStats();
const state = {
  word: "",
  slots: [], // { char, key } — key is null for spaces and other non-letters
  guessed: new Set(),
  wrong: new Set(),
  status: "playing", // "playing" | "won" | "lost"
};

function newRound() {
  state.word = drawWord();
  state.slots = [...state.word].map((char) => {
    const key = normalizeLetter(char);
    return { char, key: ALPHABET.has(key) ? key : null };
  });
  state.guessed.clear();
  state.wrong.clear();
  state.status = "playing";

  buildWord();
  resetKeyboard();
  el.result.hidden = true;
  renderLives();
  renderHint();
  announce("Nueva palabra. " + el.hint.textContent);
}

function guess(rawLetter) {
  const letter = normalizeLetter(rawLetter);
  if (state.status !== "playing" || !ALPHABET.has(letter) || state.guessed.has(letter)) return;

  state.guessed.add(letter);
  const hits = state.slots.filter((s) => s.key === letter).length;

  if (hits > 0) {
    revealLetter(letter);
    markKey(letter, "hit");
    if (state.slots.every((s) => s.key === null || state.guessed.has(s.key))) {
      return endRound("won");
    }
    announce(`Bien, la ${letter} aparece ${hits === 1 ? "una vez" : hits + " veces"}.`);
  } else {
    state.wrong.add(letter);
    markKey(letter, "miss");
    renderLives();
    shake(el.gallows);
    if (state.wrong.size >= MAX_ERRORS) return endRound("lost");
    const left = MAX_ERRORS - state.wrong.size;
    announce(`No hay ${letter}. ${left === 1 ? "Queda un intento" : `Quedan ${left} intentos`}.`);
  }
}

function endRound(status) {
  state.status = status;

  if (status === "won") {
    stats.wins++;
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
    const e = state.wrong.size;
    el.verdict.textContent =
      e === 0 ? "¡Excelente! Sin errores." : `¡Muy bien! ${e === 1 ? "Un error" : `${e} errores`}.`;
  } else {
    stats.losses++;
    stats.streak = 0;
    const missing = [...new Set(state.slots.filter((s) => s.key && !state.guessed.has(s.key)).map((s) => s.key))];
    revealMissing();
    el.verdict.textContent =
      missing.length === 1
        ? `Casi. Te faltó la ${missing[0]}.`
        : `Te faltaron ${missing.slice(0, -1).join(", ")} y ${missing.at(-1)}.`;
  }

  saveStats();
  renderScore();
  el.result.dataset.status = status;
  el.result.hidden = false;
  disableRemainingKeys();
  announce(`${status === "won" ? "Ganaste" : "Perdiste"}. La palabra era ${state.word}.`);
  el.next.focus({ preventScroll: true });
}

/* ---------- Rendering ---------- */

function buildWord() {
  const letters = state.slots.length;
  el.word.style.setProperty("--n", letters);
  el.word.replaceChildren(
    ...state.slots.map((slot) => {
      const cell = document.createElement("span");
      cell.className = slot.key ? "slot" : "slot gap";
      if (!slot.key) cell.textContent = slot.char === " " ? "" : slot.char;
      return cell;
    })
  );
  updateWordLabel();
}

function revealLetter(letter) {
  state.slots.forEach((slot, i) => {
    if (slot.key !== letter) return;
    const cell = el.word.children[i];
    cell.textContent = slot.char;
    cell.classList.add("filled");
  });
  updateWordLabel();
}

function revealMissing() {
  state.slots.forEach((slot, i) => {
    if (!slot.key || state.guessed.has(slot.key)) return;
    const cell = el.word.children[i];
    cell.textContent = slot.char;
    cell.classList.add("filled", "missed");
  });
  updateWordLabel();
}

function updateWordLabel() {
  const spoken = state.slots
    .map((s) => (s.key === null ? (s.char === " " ? "espacio" : s.char) : state.guessed.has(s.key) || state.status === "lost" ? s.char : "guion"))
    .join(", ");
  el.word.setAttribute("aria-label", `Palabra: ${spoken}`);
}

function renderHint() {
  const words = state.word.split(" ").filter(Boolean);
  const count = state.slots.filter((s) => s.key).length;
  el.hint.textContent =
    words.length > 1
      ? `${words.length} palabras, ${count} letras en total`
      : `Una palabra de ${count} letras`;
}

function renderLives() {
  const errors = state.wrong.size;
  el.tally.replaceChildren(
    ...Array.from({ length: MAX_ERRORS }, (_, i) => {
      const li = document.createElement("li");
      if (i < errors) li.className = "used";
      return li;
    })
  );
  const left = MAX_ERRORS - errors;
  el.livesText.textContent =
    left === 0 ? "Sin intentos" : left === 1 ? "Te queda 1 intento" : `Te quedan ${left} intentos`;

  el.drawing.src = `./imgs/${errors}.png`;
  el.drawing.alt = DRAWING_ALTS[errors];
}

function renderScore() {
  const { wins, losses, streak, best } = stats;
  el.score.textContent =
    wins + losses === 0
      ? "Todavía no jugaste ninguna partida."
      : `Ganadas: ${wins}. Perdidas: ${losses}. Racha actual: ${streak}. Mejor racha: ${best}.`;
}

function buildKeyboard() {
  el.keyboard.replaceChildren(
    ...KEY_ROWS.map((row) => {
      const line = document.createElement("div");
      line.className = "row";
      for (const letter of row) {
        const key = document.createElement("button");
        key.type = "button";
        key.className = "key";
        key.textContent = letter;
        key.dataset.letter = letter;
        line.append(key);
      }
      return line;
    })
  );
}

function keyFor(letter) {
  return el.keyboard.querySelector(`[data-letter="${letter}"]`);
}

function markKey(letter, result) {
  const key = keyFor(letter);
  key.dataset.state = result;
  key.disabled = true;
  key.setAttribute("aria-label", `${letter}, ${result === "hit" ? "acertada" : "no está"}`);
}

function disableRemainingKeys() {
  for (const key of el.keyboard.querySelectorAll(".key:not([data-state])")) key.disabled = true;
}

function resetKeyboard() {
  for (const key of el.keyboard.querySelectorAll(".key")) {
    key.disabled = false;
    delete key.dataset.state;
    key.removeAttribute("aria-label");
  }
}

function shake(node) {
  node.classList.remove("shake");
  void node.offsetWidth; // restart the animation on rapid misses
  node.classList.add("shake");
}

function announce(message) {
  el.live.textContent = message;
}

function renderDate() {
  const text = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  el.date.textContent = text.charAt(0).toUpperCase() + text.slice(1);
}

function preloadDrawings() {
  for (let i = 1; i <= MAX_ERRORS; i++) new Image().src = `./imgs/${i}.png`;
}

/* ---------- Events ---------- */

el.keyboard.addEventListener("click", (e) => {
  const key = e.target.closest(".key");
  if (key) guess(key.dataset.letter);
});

el.next.addEventListener("click", newRound);
el.gallows.addEventListener("animationend", () => el.gallows.classList.remove("shake"));

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;

  if (e.key === "Enter") {
    // A focused button already handles Enter through its own click.
    if (state.status !== "playing" && !(e.target instanceof HTMLButtonElement)) newRound();
    return;
  }
  if (e.key.length === 1) guess(e.key);
});

/* ---------- Start ---------- */

renderDate();
buildKeyboard();
preloadDrawings();
renderScore();
newRound();
