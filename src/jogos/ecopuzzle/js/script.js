const FRONT = "card_front";
const BACK = "card_back";
const CARD = "card";
const ICON = "icon";

const cardClick = document.querySelector("#card-click");
const cardCheck = document.querySelector("#card-check");
const cardWin = document.querySelector("#card-win");
const cardStart = document.querySelector("#card-start");

let clickBlocked = true;
let iduser;

document.addEventListener("DOMContentLoaded", () => {
  // Exibe o popup de "Como Jogar" ao iniciar a página
  showHelp();
});

function startGame(userid) {
  iduser = userid;
  cardStart.play();
  stopTime();  // Reseta o tempo ao iniciar o jogo
  startTime(); // Começa o temporizador ao iniciar o jogo
  initializeCards(game.createCardsFromTechs());

  // Desbloquear cliques após 3 segundos
  setTimeout(() => {
    clickBlocked = false;
  }, 4000);

  closeHelp(); // Fecha o popup de "Como Jogar" ao iniciar o jogo
}

function initializeCards(cards) {
  let gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  game.cards.forEach((card) => {
    let cardElement = document.createElement("div");
    cardElement.id = card.id;
    cardElement.classList.add(CARD);
    cardElement.dataset.icon = card.icon;

    setTimeout(() => {
      cardElement.classList.add("flip");
    }, 400);
    setTimeout(() => {
      cardElement.classList.remove("flip");
    }, 4000);

    createCardContent(card, cardElement);
    cardElement.addEventListener("click", flipCard);
    gameBoard.appendChild(cardElement);
  });
}

function createCardContent(card, cardElement) {
  createCardFace(FRONT, card, cardElement);
  createCardFace(BACK, card, cardElement);
}

function createCardFace(face, card, element) {
  let cardElementFace = document.createElement("div");
  cardElementFace.classList.add(face);
  if (face === FRONT) {
    let iconElement = document.createElement("img");
    iconElement.classList.add(ICON);
    iconElement.src = "./img/" + card.icon + ".png";
    cardElementFace.appendChild(iconElement);
  } else {
    let iconElement = document.createElement("img");
    iconElement.classList.add(ICON);
    iconElement.src = "./img/card.png";
    cardElementFace.appendChild(iconElement);
  }
  element.appendChild(cardElementFace);
}

async function saveRecord(time) {
  try {
    const access_token = localStorage.getItem("token");
    if (!access_token) {
      console.log("Token não encontrado");
      return false;
    }
    let res;
    const response = await fetch("https://sustenteco.onrender.com/api/record/ecopuzzle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify({ "tempo_record": time }),
      credentials: "include",
    });

    res = await response.json();
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}

function flipCard() {
  if (clickBlocked) return; // Bloquear cliques enquanto clickBlocked for true

  if (game.setCard(this.id)) {
    this.classList.add("flip");
    cardClick.play();

    if (game.secondCard) {
      if (game.checkMatch()) {
        game.clearCards();
        cardCheck.play();

        if (game.checkGameOver()) {
          let gameOverLayer = document.getElementById("gameOver");
          gameOverLayer.style.display = "flex";

          cardWin.play();
          pauseTime();
          let resultadoP = document.getElementById("resultado");
          resultadoP.textContent = `Parabéns! Tempo de jogo: ${calculateTime(time)}`;
          saveRecord(time);
        }
      } else {
        setTimeout(() => {
          let firstCardView = document.getElementById(game.firstCard.id);
          let secondCardView = document.getElementById(game.secondCard.id);

          firstCardView.classList.remove("flip");
          secondCardView.classList.remove("flip");
          game.unflipCards();
        }, 1000);
      }
    }
  }
}

function restart() {
  game.clearCards();
  startGame();
  cardStart.play();
  let gameOverLayer = document.getElementById("gameOver");
  gameOverLayer.style.display = "none";
}

// Temporizador
let interval;
let time = 0;
let timeP = document.getElementById("time");

function startTime() {
  let startTime = Date.now() - time;
  interval = setInterval(() => {
    time = Date.now() - startTime;
    timeP.textContent = calculateTime(time);
  }, 1000);
}

function pauseTime() {
  clearInterval(interval);
  timeP.textContent = calculateTime(time);
}

function stopTime() {
  time = 0;
  clearInterval(interval);
  timeP.textContent = "00:00";
}

function calculateTime(time) {
  let totalSeconds = Math.floor(time / 1000);
  let totalMinutes = Math.floor(totalSeconds / 60);

  let displaySeconds = (totalSeconds % 60).toString().padStart(2, "0");
  let displayMinutes = totalMinutes.toString().padStart(2, "0");

  return `${displayMinutes}:${displaySeconds}`;
}

// Funções para abrir/fechar o diálogo de ajuda
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

// Função para alternar tela cheia
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
