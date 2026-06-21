function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Tabs ----------
const tabButtons = document.querySelectorAll("nav.tabs button");
const views = document.querySelectorAll("section.view");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    views.forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
    if (btn.dataset.target === "gameView" && !gameStarted) startGame();
    if (btn.dataset.target === "daysView" && !daysGameStarted) startDaysGame();
  });
});

// ---------- Flashcards ----------
const cardGrid = document.getElementById("cardGrid");

function renderCards(order, container = cardGrid) {
  container.innerHTML = "";
  order.forEach((word) => {
    const card = document.createElement("div");
    card.className = "flip-card";
    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-face flip-card-front">
          <div class="flip-card-icon">${word.icon}</div>
          <div>${word.he}</div>
        </div>
        <div class="flip-card-face flip-card-back">
          <div class="flip-card-icon">${word.icon}</div>
          <div>${word.en}</div>
        </div>
      </div>`;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    container.appendChild(card);
  });
}

renderCards(WORDS);
renderCards(DAYS, document.getElementById("daysCardGrid"));

document.getElementById("shuffleBtn").addEventListener("click", () => {
  renderCards(shuffle(WORDS));
});

document.getElementById("flipAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".flip-card").forEach((c) => c.classList.toggle("flipped"));
});

// ---------- Table ----------
const tableBody = document.getElementById("wordTableBody");
WORDS.forEach((word) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="icon-cell">${word.icon}</td>
    <td class="hebrew-cell">${word.he}</td>
    <td>${word.en}</td>`;
  tableBody.appendChild(row);
});

// ---------- Memory Game ----------
const memoryGrid = document.getElementById("memoryGrid");
const gameStatusEl = document.getElementById("gameStatus");
let gameStarted = false;
let selected = [];
let matchedCount = 0;
let moves = 0;

function buildDeck() {
  const pairs = WORDS.slice(0, 8); // keep game a manageable size
  const deck = [];
  pairs.forEach((w, idx) => {
    deck.push({ pairId: idx, label: `${w.icon} ${w.he}`, lang: "he" });
    deck.push({ pairId: idx, label: w.en, lang: "en" });
  });
  return shuffle(deck);
}

function startGame() {
  gameStarted = true;
  selected = [];
  matchedCount = 0;
  moves = 0;
  updateStatus();
  const deck = buildDeck();
  memoryGrid.innerHTML = "";
  deck.forEach((item, i) => {
    const cell = document.createElement("div");
    cell.className = "memory-card";
    cell.dataset.pairId = item.pairId;
    cell.dataset.index = i;
    cell.textContent = item.label;
    cell.addEventListener("click", () => onCardClick(cell));
    memoryGrid.appendChild(cell);
  });
}

function updateStatus() {
  gameStatusEl.textContent = `התאמות: ${matchedCount}/8  |  ניסיונות: ${moves}`;
}

function onCardClick(cell) {
  if (cell.classList.contains("matched") || cell.classList.contains("selected")) return;
  if (selected.length === 2) return;

  cell.classList.add("selected");
  selected.push(cell);

  if (selected.length === 2) {
    moves++;
    const [a, b] = selected;
    if (a.dataset.pairId === b.dataset.pairId) {
      a.classList.add("matched");
      b.classList.add("matched");
      matchedCount++;
      selected = [];
      updateStatus();
      if (matchedCount === 8) {
        setTimeout(() => (gameStatusEl.textContent = "🎉 כל הכבוד! סיימת את המשחק!"), 200);
      }
    } else {
      a.classList.add("wrong");
      b.classList.add("wrong");
      setTimeout(() => {
        a.classList.remove("selected", "wrong");
        b.classList.remove("selected", "wrong");
        selected = [];
      }, 700);
      updateStatus();
    }
  }
}

document.getElementById("restartGameBtn").addEventListener("click", startGame);

// ---------- Days Order Game ----------
const daysGameGrid = document.getElementById("daysGameGrid");
const daysGameStatusEl = document.getElementById("daysGameStatus");
let daysGameStarted = false;
let nextDayIndex = 0;

function startDaysGame() {
  daysGameStarted = true;
  nextDayIndex = 0;
  updateDaysStatus();
  const shuffled = shuffle(DAYS);
  daysGameGrid.innerHTML = "";
  shuffled.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "memory-card";
    cell.dataset.dayIndex = DAYS.indexOf(day);
    cell.textContent = `${day.icon} ${day.he}`;
    cell.addEventListener("click", () => onDayClick(cell));
    daysGameGrid.appendChild(cell);
  });
}

function updateDaysStatus() {
  daysGameStatusEl.textContent = `הבא בתור: ${nextDayIndex < DAYS.length ? DAYS[nextDayIndex].he : ""}`;
}

function onDayClick(cell) {
  if (cell.classList.contains("matched")) return;
  const dayIndex = Number(cell.dataset.dayIndex);

  if (dayIndex === nextDayIndex) {
    cell.classList.add("matched");
    nextDayIndex++;
    updateDaysStatus();
    if (nextDayIndex === DAYS.length) {
      setTimeout(() => (daysGameStatusEl.textContent = "🎉 כל הכבוד! סידרת את כל הימים!"), 200);
    }
  } else {
    cell.classList.add("wrong");
    setTimeout(() => cell.classList.remove("wrong"), 500);
  }
}

document.getElementById("restartDaysGameBtn").addEventListener("click", startDaysGame);
