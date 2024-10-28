const words = ["ENERGIA", "INOVACAO", "EMPREGO", "SUSTENTAVEL", "PARCERIA", "TECNOLOGIA", "CRESCIMENTO", "COLABORACAO"];
const maxLetters = getMaxLetters(words);
const crossword = document.getElementById("crossword");
const wordList = document.getElementById("wordList");
const timerElement = document.getElementById("timer");
const gameContainer = document.getElementById("game-container");
const congratulationsContainer = document.getElementById("game-result-container");

let isMouseDown = false;
let selectedCells = [];

// Variáveis para controle de tempo
let interval;
let time = 0;

// Temporizador - funções
function startTime() {
  let startTime = Date.now() - time;
  interval = setInterval(() => {
    time = Date.now() - startTime;
    timerElement.textContent = `Tempo: ${calculateTime(time)}`;
  }, 1000);
}

function pauseTime() {
  clearInterval(interval);
  timerElement.textContent = `Tempo: ${calculateTime(time)}`;
}

function stopTime() {
  time = 0;
  clearInterval(interval);
  timerElement.textContent = "Tempo: 00:00";
}

function calculateTime(time) {
  let totalSeconds = Math.floor(time / 1000);
  let totalMinutes = Math.floor(totalSeconds / 60);

  let displaySeconds = (totalSeconds % 60).toString().padStart(2, "0");
  let displayMinutes = totalMinutes.toString().padStart(2, "0");

  return `${displayMinutes}:${displaySeconds}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Exibe o popup de "Como Jogar" ao iniciar a página
  showHelp();
});

function startGame() {
  // Iniciar o jogo e o temporizador
  stopTime(); // Garantir que o temporizador comece zerado
  clearGame();
  generateGrid();
  placeWords();
  fillEmptyCells();
  populateWordList();
  closeHelp(); // Fecha o popup de "Como Jogar"
  startTime(); // Iniciar o temporizador
}

function clearGame() {
  const cells = crossword.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("selected", "correct");
    cell.removeAttribute("data-words");
  });
  wordList.innerHTML = "";
  stopTime();
}

function resetGame() {
  clearGame();
  const gameResultContainer = document.getElementById("game-result-container");
  gameResultContainer.style.display = "none";
  gameContainer.style.display = "flex";
  // Mostrar o popup de "Como Jogar" novamente ao reiniciar
  startGame();
}

function getMaxLetters(words) {
  return Math.max(...words.map(word => word.length));
}

function generateGrid() {
  // Criar o grid de células
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      let cell = crossword.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (!cell) {
        cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener("mousedown", (e) => handleCellMouseDown(e, cell));
        cell.addEventListener("touchstart", (e) => handleCellMouseDown(e, cell));
        crossword.appendChild(cell);
      }
    }
  }
}

function placeWords() {
  // Posicionar as palavras no grid
  words.forEach((word, index) => {
    const direction = index % 2 === 0 ? "horizontal" : "vertical";
    let startRow, startCol;

    do {
      startRow = Math.floor(Math.random() * (15 - (direction === 'horizontal' ? 1 : word.length)));
      startCol = Math.floor(Math.random() * (15 - (direction === 'vertical' ? 1 : word.length)));
    } while (!isSafePlacement(word, startRow, startCol, direction));

    for (let i = 0; i < word.length; i++) {
      const cell = crossword.querySelector(`[data-row="${direction === 'horizontal' ? startRow : startRow + i}"][data-col="${direction === 'vertical' ? startCol : startCol + i}"]`);
      cell.textContent = word[i];
      if (cell.dataset.words) {
        cell.dataset.words += `,${word}`;
      } else {
        cell.dataset.words = word;
      }
    }
  });
}

function fillEmptyCells() {
  // Preencher as células vazias com letras aleatórias
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const cell = crossword.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (!cell.textContent) {
        const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        cell.textContent = randomLetter;
      }
    }
  }
}

function populateWordList() {
  // Adicionar a lista de palavras no grid
  words.forEach(word => {
    const wordItem = document.createElement("div");
    wordItem.classList.add("word-item");
    wordItem.textContent = word;
    wordList.appendChild(wordItem);
  });
}

function isSafePlacement(word, startRow, startCol, direction) {
  const endRow = direction === 'horizontal' ? startRow : startRow + word.length - 1;
  const endCol = direction === 'vertical' ? startCol : startCol + word.length - 1;

  if (endRow >= 15 || endCol >= 15) {
    return false;
  }

  for (let i = 0; i < word.length; i++) {
    const row = direction === 'horizontal' ? startRow : startRow + i;
    const col = direction === 'vertical' ? startCol : startCol + i;
    const cell = crossword.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    if (cell.textContent && cell.textContent !== word[i] && !cell.dataset.words?.includes(word)) {
      return false;
    }
  }
  return true;
}

function handleCellMouseDown(e, cell) {
  e.preventDefault();
  isMouseDown = true;
  selectedCells = [cell];
  handleCellSelection(cell);
  document.addEventListener("mousemove", handleCellMouseOver);
  document.addEventListener("touchmove", handleCellMouseOver);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("touchend", handleMouseUp);
}

function handleCellMouseOver(event) {
  let targetCell;
  if (event.type.includes("touch")) {
    const touch = event.touches[0];
    targetCell = document.elementFromPoint(touch.clientX, touch.clientY);
  } else {
    targetCell = event.target;
  }

  if (isMouseDown && targetCell.classList.contains("cell") && !selectedCells.includes(targetCell)) {
    handleCellSelection(targetCell);
    selectedCells.push(targetCell);
  }
}

function handleMouseUp() {
  isMouseDown = false;
  document.removeEventListener("mousemove", handleCellMouseOver);
  document.removeEventListener("touchmove", handleCellMouseOver);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("touchend", handleMouseUp);
  markSelectedWord();
}

function handleCellSelection(cell) {
  if (!cell.classList.contains("correct")) {
    cell.classList.add("selected");
  }
}

function markSelectedWord() {
  const selectedWord = selectedCells.map(cell => cell.textContent).join('');
  const wordObj = words.find(word => selectedCells.every(cell => cell.dataset.words?.includes(word) && selectedWord.includes(word)));
  
  if (wordObj) {
    selectedCells.forEach(cell => {
      cell.classList.remove('selected');
      cell.classList.add('correct');
    });
    const wordItem = Array.from(document.querySelectorAll('.word-item')).find(item => item.textContent === wordObj);
    if (wordItem) {
      wordItem.classList.add("strikethrough");
    }
  } else {
    selectedCells.forEach(cell => {
      cell.classList.remove('selected');
    });
  }

  selectedCells = [];
  updateWordList();
}

function updateWordList() {
  const wordItems = document.querySelectorAll(".word-item");

  let allWordsFound = true;

  wordItems.forEach(item => {
    if (!item.classList.contains("strikethrough")) {
      allWordsFound = false;
    }
  });

  if (allWordsFound) {
    pauseTime();
    showDialog();
  }
}

async function saveRecord(time) {
  try {
    const access_token = localStorage.getItem("token");
    if (!access_token) {
      console.log("Token não encontrado");
      return false;
    }
    let res;
    const response = await fetch("https://sustenteco.onrender.com/api/record/crossworld", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify({"tempo_record": time}),
      credentials: "include",
    });

    res = await response.json();
    console.log(res)
  } catch (error) {
    console.log(error);
  }
}

function showDialog() {
  pauseTime();
  const gameContainer = document.getElementById("game-container");
  const gameResultContainer = document.getElementById("game-result-container");
  const totalTimeElement = document.getElementById("total-time");
  totalTimeElement.textContent = calculateTime(time);
  saveRecord(time);
  gameContainer.style.display = "none";
  gameResultContainer.style.display = "block";
}

function showHelp() {
  const blurOverlay = document.getElementById('blur-overlay');
  const helpDialog = document.getElementById('help-dialog');

  blurOverlay.style.display = 'block';
  helpDialog.style.display = 'flex';

  // Garantir que o temporizador esteja zerado
  stopTime();
}

function closeHelp() {
  const blurOverlay = document.getElementById('blur-overlay');
  const helpDialog = document.getElementById('help-dialog');

  blurOverlay.style.display = 'none';
  helpDialog.style.display = 'none';
}

function toggleFullScreen() {
  const fullscreenIcon = document.getElementById('fullscreen-icon');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenIcon.classList.remove('fa-expand');
    fullscreenIcon.classList.add('fa-compress');
    fullscreenBtn.classList.add('fullscreen');
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      fullscreenIcon.classList.remove('fa-compress');
      fullscreenIcon.classList.add('fa-expand');
      fullscreenBtn.classList.remove('fullscreen');
    }
  }
}

const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', toggleFullScreen);
