// ---------- Confetti ----------
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confettiAnimId = null;

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

function throwConfetti() {
  const colors = ["#c0584b", "#4a7c63", "#e9c178", "#8fbfa0", "#f2b8a2", "#7fa8c9"];
  const newParticles = Array.from({ length: 150 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.3,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -2 + Math.random() * 4,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12,
  }));
  confettiParticles = confettiParticles.concat(newParticles);

  if (!confettiAnimId) animateConfetti();
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((p) => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    confettiCtx.restore();
  });

  confettiParticles = confettiParticles.filter((p) => p.y < confettiCanvas.height + 30);

  if (confettiParticles.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiAnimId = null;
  }
}

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
    if (btn.dataset.target === "bureauView" && !bureauGameStarted) startBureauGame();
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
renderCards(BUREAUCRACY, document.getElementById("bureauCardGrid"));

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
        throwConfetti();
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
    cell.textContent = day.he;
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
      throwConfetti();
    }
  } else {
    cell.classList.add("wrong");
    setTimeout(() => cell.classList.remove("wrong"), 500);
  }
}

document.getElementById("restartDaysGameBtn").addEventListener("click", startDaysGame);

// ---------- Bureaucracy Queue Game ----------
const bureauTicketEl = document.getElementById("bureauTicket");
const bureauLivesEl = document.getElementById("bureauLives");
const bureauProgressFill = document.getElementById("bureauProgressFill");
const bureauProgressCounter = document.getElementById("bureauProgressCounter");
const bureauQuestionWord = document.getElementById("bureauQuestionWord");
const bureauOptionsEl = document.getElementById("bureauOptions");
const bureauFeedbackEl = document.getElementById("bureauFeedback");

let bureauGameStarted = false;
let bureauQueue = [];
let bureauSolved = 0;
let bureauLives = 3;
let bureauTicketNumber = 1;
let bureauLocked = false;

function startBureauGame() {
  bureauGameStarted = true;
  bureauQueue = shuffle(BUREAUCRACY);
  bureauSolved = 0;
  bureauLives = 3;
  bureauTicketNumber = 1;
  bureauLocked = false;
  bureauFeedbackEl.textContent = "";
  updateBureauStatus();
  nextBureauQuestion();
}

function updateBureauStatus() {
  bureauTicketEl.textContent = bureauTicketNumber;
  bureauLivesEl.textContent = "❤️".repeat(Math.max(bureauLives, 0)) + "🖤".repeat(3 - bureauLives);
  bureauProgressFill.style.width = `${(bureauSolved / BUREAUCRACY.length) * 100}%`;
  bureauProgressCounter.textContent = `${bureauSolved} / ${BUREAUCRACY.length}`;
}

function nextBureauQuestion() {
  if (bureauSolved >= BUREAUCRACY.length) {
    bureauQuestionWord.textContent = "🎉";
    bureauOptionsEl.innerHTML = "";
    bureauFeedbackEl.textContent = "כל הכבוד! קיבלתם את האישור וסיימתם בלשכה!";
    throwConfetti();
    return;
  }

  bureauLocked = false;
  const word = bureauQueue[bureauSolved];
  bureauQuestionWord.textContent = `${word.icon} ${word.he}`;

  const distractors = shuffle(BUREAUCRACY.filter((w) => w.he !== word.he)).slice(0, 3);
  const options = shuffle([word, ...distractors]);

  bureauOptionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "bureau-option";
    btn.textContent = opt.en;
    btn.addEventListener("click", () => onBureauAnswer(btn, opt.he === word.he));
    bureauOptionsEl.appendChild(btn);
  });
}

function onBureauAnswer(btn, isCorrect) {
  if (bureauLocked) return;
  bureauLocked = true;

  if (isCorrect) {
    btn.classList.add("correct");
    bureauSolved++;
    bureauTicketNumber++;
    bureauFeedbackEl.textContent = "🔖 חותמת אושרה! לעמדה הבאה.";
    updateBureauStatus();
    setTimeout(nextBureauQuestion, 700);
  } else {
    btn.classList.add("wrong");
    bureauLives--;
    bureauFeedbackEl.textContent = "🚫 \"זה לא הטופס הנכון, גש לעמדה אחרת\" - אומר הפקיד.";
    updateBureauStatus();
    if (bureauLives <= 0) {
      setTimeout(() => {
        bureauFeedbackEl.textContent = "💀 נשלחתם לסוף התור... ננסה שוב!";
        setTimeout(startBureauGame, 1200);
      }, 700);
    } else {
      setTimeout(nextBureauQuestion, 900);
    }
  }
}

document.getElementById("restartBureauBtn").addEventListener("click", startBureauGame);
