/* ----------------------------
   PRAEITAS / ESAMAS KODAS:
   Formos validacija (palikta beveik nepakitusi)
   ---------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("#custom-contact-form");
  const submitBtn = document.querySelector("#custom-submit");

  // Visi formos laukai
  const fields = {
    vardas: document.querySelector("#vardas"),
    pavarde: document.querySelector("#pavarde"),
    email: document.querySelector("#email"),
    tel: document.querySelector("#tel"),
    adresas: document.querySelector("#adresas"),
    q1: document.querySelector("#q1"),
    q2: document.querySelector("#q2"),
    q3: document.querySelector("#q3"),
  };

  // -------- REAL-TIME VALIDACIJA -------------
  const validators = {
    vardas: value => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(value),
    pavarde: value => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(value),
    email: value => /^\S+@\S+\.\S+$/.test(value),
    adresas: value => value.trim().length > 3,
    q1: value => value >= 1 && value <= 10,
    q2: value => value >= 1 && value <= 10,
    q3: value => value >= 1 && value <= 10,
  };

  const errors = {};

  function showError(field, message) {
    errors[field] = true;
    const input = fields[field];
    input.classList.add("error");

    let msg = input.nextElementSibling;
    if (!msg || !msg.classList.contains("error-msg")) {
      msg = document.createElement("small");
      msg.classList.add("error-msg");
      input.insertAdjacentElement("afterend", msg);
    }
    msg.textContent = message;

    updateSubmitButton();
  }

  function clearError(field) {
    errors[field] = false;
    const input = fields[field];
    input.classList.remove("error");

    let msg = input.nextElementSibling;
    if (msg && msg.classList.contains("error-msg")) msg.remove();

    updateSubmitButton();
  }

  // -------- TELEFONO FORMATAVIMAS ------------
  fields.tel.addEventListener("input", () => {
    let raw = fields.tel.value.replace(/\D/g, "");
    // saugus prefix patikrinimas: jeigu vartotojas įveda savo, leidžiame
    if (!raw.startsWith("3706")) {
      // jeigu dar nėra daug skaitmenų, neprimetame
      if (raw.length >= 4) {
        raw = "3706" + raw.slice(4);
      }
    }

    if (raw.length > 11) raw = raw.slice(0, 11);

    const formatted = raw ? `+${raw.slice(0, 3)} ${raw.slice(3, 4)}${raw.slice(4, 6)} ${raw.slice(6)}` : "";
    fields.tel.value = formatted;
  });

  // -------- REAL-TIME VALIDACIJOS PRIJUNGIMAS -----------
  Object.keys(fields).forEach(field => {
    if (field === "tel") return;

    fields[field].addEventListener("input", () => {
      const value = fields[field].value.trim();

      if (!value) {
        showError(field, "Laukas negali būti tuščias.");
      } else if (validators[field] && !validators[field](value)) {
        showError(field, "Neteisingas formato įvedimas.");
      } else {
        clearError(field);
      }
    });
  });

  // ---- SUBMIT mygtuko valdymas -----
  function updateSubmitButton() {
    const hasErrors = Object.values(errors).some(e => e === true);
    submitBtn.disabled = hasErrors;
  }

  // -------- FORMOS PATEIKIMAS -------------
  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      vardas: fields.vardas.value,
      pavarde: fields.pavarde.value,
      email: fields.email.value,
      telefonas: fields.tel.value,
      adresas: fields.adresas.value,
      q1: Number(fields.q1.value),
      q2: Number(fields.q2.value),
      q3: Number(fields.q3.value),
    };

    console.log("Formos duomenys:", data);

    const avg = ((data.q1 + data.q2 + data.q3) / 3).toFixed(1);

    // Atvaizdavimas svetainėje
    const output = document.querySelector("#form-output");
    output.innerHTML = `
      <p><strong>Vardas:</strong> ${data.vardas}</p>
      <p><strong>Pavardė:</strong> ${data.pavarde}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefonas:</strong> ${data.telefonas}</p>
      <p><strong>Adresas:</strong> ${data.adresas}</p>
      <p><strong>Klausimas 1:</strong> ${data.q1}</p>
      <p><strong>Klausimas 2:</strong> ${data.q2}</p>
      <p><strong>Klausimas 3:</strong> ${data.q3}</p>
      <hr>
      <p><strong>${data.vardas} ${data.pavarde}: ${avg}</strong></p>
    `;

    // ---- POPUP ----
    const popup = document.querySelector("#popup-success");
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
  });

  /* ----------------------------
     NAUJAS KODAS: MEMORY GAME
     ---------------------------- */

  // DOM elementai
  const boardGrid = document.querySelector("#board-grid");
  const startBtn = document.querySelector("#start-btn");
  const resetBtn = document.querySelector("#reset-btn");
  const movesEl = document.querySelector("#moves");
  const matchesEl = document.querySelector("#matches");
  const timerEl = document.querySelector("#timer");
  const winMessage = document.querySelector("#win-message");
  const bestEasyEl = document.querySelector("#best-easy");
  const bestHardEl = document.querySelector("#best-hard");

  // Duomenų rinkinys kortelėms (12 unikalių elementų, pakanka 6 ir 12 paryšiui)
  const UNIQUE_CONTENT = ["🍎","🚗","⚽","🎧","📷","🌟","🐶","🎲","🎵","📚","💡","🧩"];

  // Game state
  let difficulty = "easy"; // 'easy' or 'hard'
  let cols = 4, rows = 3; // pagal difficulty
  let totalPairs = 6;
  let cards = []; // kortelių masyvas (duplikatai)
  let flipped = []; // atverstos kortelės (indexes)
  let matchedCount = 0;
  let moves = 0;
  let timer = null;
  let secondsElapsed = 0;
  let gameStarted = false;
  let lockBoard = false;

  // LOCALSTORAGE keys
  const BEST_KEY_EASY = "memory_best_easy";
  const BEST_KEY_HARD = "memory_best_hard";

  // Inicializacija: nuskaitome geriausius rezultatus
  function loadBestScores() {
    const be = localStorage.getItem(BEST_KEY_EASY);
    const bh = localStorage.getItem(BEST_KEY_HARD);
    bestEasyEl.textContent = be ? be + " ėjimai" : "—";
    bestHardEl.textContent = bh ? bh + " ėjimai" : "—";
  }

  loadBestScores();

  // Difficulty change listener
  document.querySelectorAll('input[name="difficulty"]').forEach(r => {
    r.addEventListener("change", (e) => {
      difficulty = e.target.value;
      setGridByDifficulty();
      // jei žaidimas vyko, perkrauname lenta į pradinę būseną
      resetGame(false);
    });
  });

  function setGridByDifficulty(){
    if (difficulty === "easy") { cols = 4; rows = 3; totalPairs = 6; }
    else { cols = 6; rows = 4; totalPairs = 12; }
    boardGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardGrid.classList.remove("small","large");
  }
  setGridByDifficulty();

  // Generuok kortelių masyvą (atsitiktinė tvarka)
  function generateDeck() {
    // paimame pirmus totalPairs elementų iš UNIQUE_CONTENT
    const pool = UNIQUE_CONTENT.slice(0, totalPairs);
    const pairItems = pool.concat(pool); // du kartus
    // shuffle
    for (let i = pairItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairItems[i], pairItems[j]] = [pairItems[j], pairItems[i]];
    }
    return pairItems;
  }

  // Sukurk kortelės DOM elementą
  function createCard(content, index) {
    const c = document.createElement("div");
    c.classList.add("card");
    c.dataset.index = index;

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");
    front.innerHTML = ""; // tuščias (arba galima mažas simbolis)

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.innerHTML = content;

    inner.appendChild(front);
    inner.appendChild(back);
    c.appendChild(inner);

    // Click handler
    c.addEventListener("click", () => handleCardClick(c, content, index));

    return c;
  }

  // Rodyti laiką formatu MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Timer funkcijos
  function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
      secondsElapsed++;
      timerEl.textContent = formatTime(secondsElapsed);
    }, 1000);
  }
  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function resetTimer() {
    stopTimer();
    secondsElapsed = 0;
    timerEl.textContent = "00:00";
  }

  // Pagrindinis kortelės click handler
  function handleCardClick(cardEl, content, index) {
    if (lockBoard) return;
    if (!gameStarted) return; // leidžiame vartotojui spustelėti tik prasidėjus žaidimui
    if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;

    // atveriam kortelę
    cardEl.classList.add("flipped");
    flipped.push({ el: cardEl, content, index });

    if (flipped.length === 1) {
      // pirmas atvertimas – nieko nedarom
      return;
    }

    if (flipped.length === 2) {
      // padidinam ėjimų skaičių
      moves++;
      movesEl.textContent = moves;

      const [a, b] = flipped;

      if (a.content === b.content) {
        // match
        a.el.classList.add("matched");
        b.el.classList.add("matched");
        matchedCount++;
        matchesEl.textContent = matchedCount;

        // clear flipped
        flipped = [];

        // tikrinam laimėjimą
        if (matchedCount === totalPairs) {
          endGame();
        }
      } else {
        // no match — užblokuojam lentele trumpam ir apverčiam atgal per ~1s
        lockBoard = true;
        setTimeout(() => {
          a.el.classList.remove("flipped");
          b.el.classList.remove("flipped");
          flipped = [];
          lockBoard = false;
        }, 1000);
      }
    }
  }

  // Paleidžia naują partiją
  function startGame() {
    // jeigu jau žaidimas prasidėjęs, perkraunam vietoj to
    resetGame(true);
    gameStarted = true;
    startTimer();
    winMessage.classList.remove("show");
  }

  // Atnaujina DOM lentą
  function renderBoard() {
    boardGrid.innerHTML = "";
    // generuojam deck
    cards = generateDeck();
    cards.forEach((content, idx) => {
      const card = createCard(content, idx);
      boardGrid.appendChild(card);
    });
    // reset state displays
    movesEl.textContent = moves;
    matchesEl.textContent = matchedCount;
    timerEl.textContent = formatTime(secondsElapsed);
  }

  // Užbaigia žaidimą
  function endGame() {
    stopTimer();
    gameStarted = false;
    winMessage.classList.add("show");

    // Persist best score if geresnis (mažiau ėjimų)
    const key = difficulty === "easy" ? BEST_KEY_EASY : BEST_KEY_HARD;
    const prev = localStorage.getItem(key);
    if (!prev || moves < Number(prev)) {
      localStorage.setItem(key, moves.toString());
      // atnaujinam parodymą
      loadBestScores();
    }
  }

  // Reset funkcija: jei keepGrid true, išsaugo parinktį, bet vis tiek permaišo
  function resetGame(keepGrid = true) {
    // atstatom state
    flipped = [];
    matchedCount = 0;
    moves = 0;
    matchedCount = 0;
    movesEl.textContent = moves;
    matchesEl.textContent = matchedCount;
    winMessage.classList.remove("show");
    resetTimer();
    stopBoardAnimations();
    // re-render
    renderBoard();
  }

  function stopBoardAnimations(){
    // placeholder jei reikalinga
  }

  // Start / reset mygtukų prijungimas
  startBtn.addEventListener("click", () => {
    if (!gameStarted) {
      startGame();
    } else {
      // jei žaidimas vyksta - treat as restart
      resetGame(true);
      gameStarted = true;
      startTimer();
    }
  });

  resetBtn.addEventListener("click", () => {
    // atnaujinti – naujas žaidimas, neperkrovus puslapio
    resetGame(true);
    gameStarted = false;
    winMessage.classList.remove("show");
  });

  // Inicijuojam pradinei būsenai
  setGridByDifficulty();
  resetGame();

  // Pridedam klaviatūros palaikymą: Space pradėti/ sustabdyti
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!gameStarted) startGame();
      else resetGame(true);
    }
  });

  // papildoma: užtikrinti, kad boardGrid tinkamai persidėstytų jei iškviesta per JS
  window.addEventListener("resize", () => {
    setGridByDifficulty();
  });

  // Paspaudus ant kortelės prieš start — neleidžiama; (saugiklis jau aukščiau)
  // load best scores on init
  loadBestScores();

});