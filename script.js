const global = {
  chances: 6,
  boxes: 6,
};

let revealing = false;
let dialogOpener;

function closeStats() {
  document.getElementById("modal").classList.add("hidden");
  document.querySelector(".page-shell").inert = false;
  document.querySelector(".site-header").inert = false;
  document.querySelector(".site-footer").inert = false;
  dialogOpener?.focus();
}

document
  .querySelector("[data-close-dialog]")
  .addEventListener("click", closeStats);
document.getElementById("modal").addEventListener("click", (event) => {
  if (event.target.id === "modal") closeStats();
});
document.addEventListener("keydown", (event) => {
  const modal = document.getElementById("modal");
  if (modal.classList.contains("hidden")) return;
  if (event.key === "Escape") closeStats();
  if (event.key === "Tab") {
    const buttons = [...modal.querySelectorAll("button:not(.hidden)")];
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

async function startUp() {
  const main = document.getElementById("game");
  main.textContent = "Carregando o desafio…";
  main.dataset.ready = "false";
  try {
    setState();
    const { book, chapter, verse } = await getRandomVerse();
    setSecret(book, chapter, verse);
    main.textContent = "";
    await drawVersicle(main, book, chapter, verse);
    drawGrid(main, global.chances, global.boxes);
    drawKeyboard(main);
    keyboardEvent();
    updateKeyboard();
    const state = getState();
    if (state.won || state.gameOver) {
      showAnswer();
      showStatsModal();
    }
    main.dataset.ready = "true";
    document.getElementById("stats").disabled = false;
    document.dispatchEvent(new Event("biblio:ready"));
  } catch {
    main.textContent = "";
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent =
      "Não foi possível carregar o desafio. Verifique sua conexão e se o navegador permite salvar o progresso deste site.";
    const retry = document.createElement("button");
    retry.textContent = "Tentar novamente";
    retry.onclick = () => location.reload();
    main.append(message, retry);
  }
}

function validProgress(state) {
  return (
    state &&
    Number.isInteger(state.currentRow) &&
    state.currentRow >= 0 &&
    state.currentRow < global.chances &&
    Number.isInteger(state.currentColumn) &&
    state.currentColumn >= 0 &&
    state.currentColumn <= global.boxes &&
    typeof state.won === "boolean" &&
    typeof state.gameOver === "boolean" &&
    Array.isArray(state.grid) &&
    state.grid.length === global.chances &&
    state.grid.every(
      (row) =>
        Array.isArray(row) &&
        row.length === global.boxes &&
        row.every(
          (letter) => typeof letter === "string" && /^[A-Z0-9]?$/.test(letter),
        ),
    )
  );
}

function updateState(key, value) {
  const state = JSON.parse(localStorage.getItem("state"));

  localStorage.setItem(
    "state",
    JSON.stringify({
      ...state,
      [key]: value,
    }),
  );
}

function updateCurrentColumn(value) {
  const state = JSON.parse(localStorage.getItem("state"));

  localStorage.setItem(
    "state",
    JSON.stringify({
      ...state,
      currentColumn: value >= 0 ? value : state.currentColumn + 1,
    }),
  );
}

function updateCurrentRow(value) {
  const state = JSON.parse(localStorage.getItem("state"));

  localStorage.setItem(
    "state",
    JSON.stringify({
      ...state,
      currentRow: value >= 0 ? value : state.currentRow + 1,
    }),
  );
}

function setState() {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  let timeUntilMidnight = tomorrow.getTime() - Date.now();

  let state;
  try {
    state = JSON.parse(localStorage.getItem("state"));
  } catch {
    state = null;
  }

  if (
    !validProgress(state) ||
    Date.now() >= state.expirationTime ||
    !state.expirationTime ||
    state.translation !== "blivre-2018"
  ) {
    localStorage.setItem(
      "state",
      JSON.stringify({
        translation: "blivre-2018",
        currentRow: 0,
        currentColumn: 0,
        grid: Array(6)
          .fill()
          .map(() => Array(6).fill("")),
        versicle: "",
        won: false,
        gameOver: false,
        currentGame: getSequentialNumber(),
        expirationTime: Date.now() + timeUntilMidnight,
      }),
    );
  }
}

function getState() {
  return JSON.parse(localStorage.getItem("state"));
}

async function drawVersicle(container, book, chapter, verse) {
  const state = getState();
  let verseText = state.versicle;
  if (!verseText) {
    const response = await fetch("./bible.json");
    if (!response.ok) throw new Error("Texto bíblico indisponível");
    const data = await response.json();
    const selectedBook = data.find(({ abbrev }) => abbrev === book);
    verseText = selectedBook?.chapters[chapter - 1]?.[verse - 1];
    if (!verseText) throw new Error("Referência bíblica indisponível");
    updateState("answer", getAnswer(selectedBook.name, chapter, verse));
    updateState("versicle", verseText);
  }
  const text = document.createElement("h2");
  text.textContent = "“" + verseText + "”";
  const wrapper = document.createElement("div");
  wrapper.className = "versicle";
  wrapper.appendChild(text);
  container.appendChild(wrapper);
}

function getAnswer(book, chapter, versicle) {
  let answer = "";

  answer += book + " ";
  answer += chapter + ":";
  answer += versicle;

  return answer;
}

function keyboardEvent() {
  document.body.onkeydown = (event) => {
    if (event.target.closest?.("input, textarea, select, a, button:not(.key)"))
      return;
    if (event.key === "Enter" || event.key === "Backspace")
      event.preventDefault();
  };
  document.body.onkeyup = (event) => {
    const { currentColumn, won, gameOver } = getState();
    const editable = event.target.closest?.(
      "input, textarea, select, a, button:not(.key)",
    );
    const overlay = document.querySelector(".game-dialog:not(.hidden)");
    if (
      won ||
      gameOver ||
      revealing ||
      editable ||
      overlay ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    const isLetter = (key) => key.match(/[a-z]/i) && key.length === 1;
    const isNumber = (key) => key.match(/^\d$/) && key.length === 1;

    if (isLetter(event.key) && currentColumn < 2) {
      addLetter(event.key);
    }

    if (
      isNumber(event.key) &&
      currentColumn >= 2 &&
      currentColumn < global.boxes
    ) {
      addLetter(event.key);
    }

    if (event.key === "Backspace") {
      removeLetter();
    }

    if (event.key === "Enter") {
      onEnter();
    }

    updateBox();
  };
}

function drawGrid(container, chances, boxes) {
  const grid = document.createElement("div");

  grid.className = "grid";

  for (let i = 0; i < chances; i++) {
    for (let j = 0; j < boxes; j++) {
      const box = drawBox(i, j);

      if (j === 1) {
        box.classList.add("space");
      }
      if (j === 4) {
        const colon = document.createElement("p");
        colon.className = "colon";
        colon.textContent = ":";
        grid.appendChild(colon);
      }
      grid.appendChild(box);
    }
  }

  container.appendChild(grid);
}

function drawBox(row, column) {
  const { grid, secret, currentColumn, currentRow, won, gameOver } = getState();
  const box = document.createElement(`div`);
  const letter = grid[row][column];
  const colors = guessColors(grid[row], secret);

  box.className = "box";
  box.id = `box${row}${column}`;

  if (letter) {
    box.textContent = letter;

    if (row < currentRow || won || gameOver) box.classList.add(colors[column]);
  }

  if (!won && !gameOver && row === currentRow && column === currentColumn) {
    box.classList.add("focus");
  }

  if (!won && !gameOver && row === currentRow) {
    box.classList.add("active");
  }

  box.setAttribute(
    "aria-label",
    `Tentativa ${row + 1}, posição ${column + 1}${letter ? ": " + letter : ": vazia"}`,
  );

  return box;
}

function drawKeyboard(container) {
  const keyboard = document.createElement("div");
  keyboard.className = "keyboard";

  const keys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
    ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
  ];

  for (let i = 0; i < keys.length; i++) {
    const keyboardRow = document.createElement("div");
    keyboardRow.className = "keyboard-row";

    for (const key of keys[i]) {
      const keyButton = document.createElement("button");
      keyButton.classList.add("key");
      keyButton.id = key;
      keyButton.type = "button";
      keyButton.textContent = key === "Backspace" ? "←" : key;
      if (key === "Backspace")
        keyButton.setAttribute("aria-label", "Apagar último caractere");
      if (key === "Enter")
        keyButton.setAttribute("aria-label", "Enviar tentativa");

      keyButton.onclick = () => keyboardClick(key);

      keyboardRow.appendChild(keyButton);
    }

    keyboard.appendChild(keyboardRow);
  }

  container.appendChild(keyboard);
}

function updateKeyboard() {
  const { currentRow, secret, grid, won, gameOver } = getState();
  const completedRows = won || gameOver ? currentRow + 1 : currentRow;
  const rank = { "key-wrong": 1, "key-parcial": 2, "key-right": 3 };
  for (let row = 0; row < completedRows; row++) {
    for (let column = 0; column < global.boxes; column++) {
      const letter = grid[row][column];
      const key = document.getElementById(letter);
      if (!key) continue;
      const color =
        letter === secret[column]
          ? "key-right"
          : secret.includes(letter)
            ? "key-parcial"
            : "key-wrong";
      const previous = Object.keys(rank).find((name) =>
        key.classList.contains(name),
      );
      if (!previous || rank[color] > rank[previous]) {
        key.classList.remove(...Object.keys(rank));
        key.classList.add(color);
      }
    }
  }
}

function keyboardClick(key) {
  const event = new KeyboardEvent("keyup", { key: key });
  document.body.dispatchEvent(event);
}

function addLetter(letter) {
  const { currentColumn, currentRow, grid } = getState();

  grid[currentRow][currentColumn] = letter.toUpperCase();

  updateState("grid", grid);

  if (currentColumn < global.boxes) updateCurrentColumn();
}

function onEnter() {
  const { grid, currentRow } = getState();

  const word = grid[currentRow];

  if (!validateBook(word) || word.join("").length !== global.boxes) {
    cleanRow();
  } else {
    revealWord(word);
  }
}

function guessColors(guess, secret) {
  const remaining = [...secret];
  const colors = guess.map((letter, i) => {
    if (letter === secret[i]) {
      remaining[i] = "";
      return "right";
    }
    return "wrong";
  });
  guess.forEach((letter, i) => {
    if (!letter || colors[i] === "right") return;
    const index = remaining.indexOf(letter);
    if (index !== -1) {
      colors[i] = "parcial";
      remaining[index] = "";
    }
  });
  return colors;
}

function revealWord(guess) {
  if (revealing) return;
  revealing = true;
  const { secret, currentRow } = getState();
  const animationDelay = 500;
  const finishDelay = (7 * animationDelay) / 2;
  const colors = guessColors(guess, secret);

  for (let i = 0; i < global.boxes; i++) {
    const box = document.getElementById(`box${currentRow}${i}`);
    setTimeout(
      () => {
        box.classList.add(colors[i]);
        box.classList.remove("active", "focus");
        box.setAttribute(
          "aria-label",
          `Tentativa ${currentRow + 1}, posição ${i + 1}: ${guess[i]}, ${colors[i] === "right" ? "correto" : colors[i] === "parcial" ? "em outra posição" : "ausente"}`,
        );
      },
      ((i + 1) * animationDelay) / 2,
    );

    box.classList.add("animated");
    box.style.animationDelay = `${(i * animationDelay) / 2}ms`;
  }

  const win = guess.join("") === secret.join("");
  const gameOver = currentRow === 5;
  // Salve ao enviar para que recarregar durante a animação seja seguro.
  if (win) updateState("won", true);
  else if (gameOver) updateState("gameOver", true);
  else {
    updateCurrentRow();
    updateCurrentColumn(0);
  }
  if (win || gameOver) updateStats();
  setTimeout(() => {
    revealing = false;
    updateKeyboard();
    document.getElementById("game-feedback").textContent = win
      ? "Referência correta!"
      : gameOver
        ? "Tentativas encerradas. Veja a referência abaixo."
        : `Tentativa ${currentRow + 1} enviada. Verde: posição correta. Amarelo: em outra posição. Cinza: ausente.`;
    if (win) {
      setGameWin();
      showAnswer();
      showStatsModal();
    } else if (gameOver) {
      showAnswer();
      showStatsModal();
    } else changeActiveRow();
  }, finishDelay);
}

function updateStats() {
  const stats = getStats();
  const { won, gameOver, currentGame } = getState();

  if (!stats.games) {
    localStorage.setItem(
      "stats",
      JSON.stringify({
        winStreak: won ? 1 : 0,
        games: 1,
        wins: won ? 1 : 0,
        maxStreak: won ? 1 : 0,
        lastWin: won ? currentGame : null,
      }),
    );
  } else {
    const winStreak = gameOver
      ? 0
      : won && stats.lastWin + 1 === currentGame
        ? stats.winStreak + 1
        : 1;
    const maxStreak = stats.maxStreak > winStreak ? stats.maxStreak : winStreak;
    localStorage.setItem(
      "stats",
      JSON.stringify({
        winStreak,
        games: stats.games + 1,
        wins: stats.wins + (won ? 1 : 0),
        maxStreak,
        lastWin: won ? currentGame : stats.lastWin,
      }),
    );
  }

  const createdStats = JSON.parse(localStorage.getItem("stats"));
  window.biblioTrack?.("event", "user_stats", createdStats);
}

function getStats() {
  try {
    return (
      JSON.parse(localStorage.getItem("stats")) || {
        games: 0,
        wins: 0,
        winStreak: 0,
        maxStreak: 0,
      }
    );
  } catch {
    return { games: 0, wins: 0, winStreak: 0, maxStreak: 0 };
  }
}

function changeActiveRow() {
  const { currentRow } = getState();
  for (let i = 0; i < global.boxes; i++) {
    const box = document.getElementById(`box${currentRow}${i}`);

    box.classList.add("active");

    if (i === 0) {
      box.classList.add("focus");
    }
  }
}

function setGameWin() {
  const { currentRow } = getState();

  for (let i = 0; i < global.boxes; i += 1) {
    const box = document.getElementById(`box${currentRow}${i}`);
    box.style.animationDelay = `0ms`;
    box.classList.add("win-animated");
  }
}

function showAnswer() {
  const { answer } = getState();
  const tag = document.createElement("div");
  const tagText = document.createElement("h4");
  document.getElementById("tag")?.remove();
  tag.id = "tag";
  tag.setAttribute("role", "status");
  tagText.textContent = answer;
  tag.appendChild(tagText);
  document.getElementById("game").appendChild(tag);
}

function showAlert(alert) {
  const body = document.getElementsByTagName("body")[0];
  const alertTag = document.createElement("div");
  const alertText = document.createElement("h4");
  alertTag.id = "alert";
  alertText.textContent = alert;
  alertTag.appendChild(alertText);
  body.appendChild(alertTag);
  setTimeout(() => alertTag.remove(), 2500);
}

function cleanRow() {
  const { grid, currentRow } = getState();

  for (let i = 0; i < global.boxes; i += 1) {
    grid[currentRow][i] = "";
    updateState("grid", grid);

    const box = document.getElementById(`box${currentRow}${i}`);
    box.classList.add("empty-animated");

    setTimeout(() => {
      box.classList.remove("empty-animated");
    }, 550);
  }

  updateCurrentColumn(0);
}

function validateBook(word) {
  const books = Object.keys(bible).map((abbrv) =>
    abbrv
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  );
  const book = word.slice(0, 2).join("");
  return books.includes(book);
}

function removeLetter() {
  const { grid, currentColumn, currentRow } = getState();

  if (currentColumn === 0) return;
  updateCurrentColumn(currentColumn - 1);
  grid[currentRow][currentColumn - 1] = "";
  updateState("grid", grid);
}

function updateBox() {
  const { grid, currentRow, currentColumn } = getState();

  for (let i = 0; i < global.chances; i += 1) {
    for (let j = 0; j < global.boxes; j += 1) {
      const box = document.getElementById(`box${i}${j}`);

      if (i === currentRow && j === currentColumn) {
        box.classList.add("focus");
      } else {
        box.classList.remove("focus");
      }

      const letter = grid[i][j];
      box.textContent = letter;
      if (i === currentRow)
        box.setAttribute(
          "aria-label",
          `Tentativa ${i + 1}, posição ${j + 1}: ${letter || "vazia"}`,
        );
    }
  }
}

async function createShareContent() {
  window.biblioTrack?.("event", "share_button_click", {
    event_category: "Social",
    event_label: "User clicked the share button",
  });

  const stats = getStats();
  const { currentGame, versicle } = getState();

  const shareData = {
    title: "Biblio",
    text: "",
    url: "",
  };

  let shareText = `Joguei bibliooo.com.br #${currentGame} 🔥${stats.winStreak}\n\n`;

  for (let i = 0; i < global.chances; i += 1) {
    let linUsed = false;
    for (let j = 0; j < global.boxes; j += 1) {
      const box = document.getElementById(`box${i}${j}`);

      if (box && box.textContent) {
        linUsed = true;
        const classList = box.classList;
        let square;

        if (classList.contains("wrong")) {
          square = "⬛";
        } else if (classList.contains("right")) {
          square = "🟩";
        } else if (classList.contains("parcial")) {
          square = "🟨";
        }

        shareText += square;
      }
    }

    if (linUsed) shareText += "\n";
  }

  shareText += `\n"${versicle}" — BLIVRE\n`;

  shareData.text = shareText;

  try {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareText);
      showAlert("Texto copiado!");
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

function getSequentialNumber() {
  const dayOne = getDateOne();
  const currentDate = new Date();

  const dayDifference = Math.floor(
    (currentDate - dayOne) / (1000 * 60 * 60 * 24),
  );

  const sequentialNumber = dayDifference + 1;

  return sequentialNumber;
}

async function getRandomVerse() {
  const actualDate = getUserDate().toISOString().slice(0, 10);
  const hash = await sha256(actualDate);

  const books = Object.keys(bible);

  // Convert part of the hash to decide the book index
  const booksIndex = parseInt(hash.slice(0, 8), 16) % books.length;

  const book = books[booksIndex];
  const chapters = bible[book];

  // Convert another part of the hash to decide the chapter index
  const chapterIndex = parseInt(hash.slice(8, 16), 16) % chapters.length;

  const { chapter, versicles } = chapters[chapterIndex];

  // Convert another part of the hash to decide the verse index
  const verseIndex = parseInt(hash.slice(16, 24), 16) % versicles;

  // Return the result ensuring chapter and verse have valid values
  return {
    book,
    chapter: chapter || 1,
    verse: verseIndex + 1, // verses start from 1
  };
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function setSecret(book, chapter, verse) {
  let answer = "";

  answer += book
    .slice(0, 2)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  answer += chapter.toString().length === 2 ? chapter : "0" + chapter;
  answer += verse.toString().length === 2 ? verse : "0" + verse;

  updateState("secret", answer.split(""));
}

function showStatsModal() {
  const stats = getStats();
  const state = getState();
  const percentage = stats.games ? (stats.wins * 100) / stats.games : 0;

  const modal = document.getElementById("modal");
  const modalHeader = document.getElementsByClassName("modal-title")[0];
  const statDiv = document.querySelectorAll(".stat");
  const button = document.getElementById("share-button");

  const played = state.won || state.gameOver;

  const text = state.won ? "Parabéns!" : played ? "Que pena!" : "";
  modalHeader.innerHTML = `${played ? text + "<br/>" : ""}<span>${played ? "Volte amanhã para um novo versículo." : "Todo dia um novo versículo!"}</span>`;

  const statsToShow = [
    { stat: stats.games, title: "Total de jogos" },
    {
      stat: `${percentage.toFixed(1).replace(".0", "")}%`,
      title: "Porcentagem de vitórias",
    },
    { stat: stats.winStreak, title: "Sequência atual" },
    { stat: stats.maxStreak, title: "Sequência máxima" },
  ];

  for (let i = 0; i < statDiv.length; i += 1) {
    statDiv[i].querySelector(".stat-number").textContent = statsToShow[i].stat;
    statDiv[i].querySelector(".stat-name").textContent = statsToShow[i].title;
  }

  button.onclick = () => createShareContent();

  if (!played) {
    button.classList.add("hidden");
  } else {
    button.classList.remove("hidden");
  }

  dialogOpener = document.activeElement;
  modal.classList.remove("hidden");
  document.querySelector(".page-shell").inert = true;
  document.querySelector(".site-header").inert = true;
  document.querySelector(".site-footer").inert = true;
  modal.querySelector("[data-close-dialog]").focus();
}

function getUserDate() {
  const currentDate = new Date();
  const timezoneOffset = currentDate.getTimezoneOffset();
  const offsetMilliseconds = timezoneOffset * 60 * 1000;
  return new Date(currentDate.getTime() - offsetMilliseconds);
}

function getDateOne() {
  const currentDate = new Date("2024-04-26");
  currentDate.setUTCHours(0, 0, 0, 0);
  return currentDate;
}

startUp();
