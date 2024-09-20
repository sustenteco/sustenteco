const inputs = document.querySelector(".inputs"),
  resetBtns = document.querySelectorAll(".reset-btn"),
  hint = document.querySelector(".hint span"),
  guessLeft = document.querySelector(".guess-left span"),
  typingInput = document.querySelector(".typing-input"),
  gameContainer = document.getElementById("game-container"),
  resultContainer = document.getElementById("result-container"),
  totalErrors = document.getElementById("total-errors"),
  totalTime = document.getElementById("total-time"),
  resultMessage = document.getElementById("result-message"),
  helpContainer = document.getElementById("help-container"),
  gameTitle = document.getElementById("game-title"),
  gameContent = document.getElementById("game-content");

var word,
  maxGuesses,
  corrects = [],
  incorrects = [],
  gameOver = false;

// Variáveis para controle de tempo
let interval;
let time = 0; // Tempo em milissegundos

// Temporizador - funções
function startTime() {
  let startTime = Date.now() - time;
  interval = setInterval(() => {
    time = Date.now() - startTime;
    document.getElementById("time").innerText = calculateTime(time);
  }, 1000);
}

function pauseTime() {
  clearInterval(interval);
  document.getElementById("time").innerText = calculateTime(time);
}

function stopTime() {
  time = 0;
  clearInterval(interval);
  document.getElementById("time").innerText = "00:00";
}

function calculateTime(time) {
  let totalSeconds = Math.floor(time / 1000);
  let totalMinutes = Math.floor(totalSeconds / 60);

  let displaySeconds = (totalSeconds % 60).toString().padStart(2, "0");
  let displayMinutes = totalMinutes.toString().padStart(2, "0");

  return `${displayMinutes}:${displaySeconds}`;
}

function createKeyboard() {
  const keyboardContainer = document.getElementById('keyboard');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  keyboardContainer.innerHTML = ''; // Limpa o conteúdo anterior
  
  alphabet.forEach(letter => {
    const button = document.createElement('button');
    button.innerText = letter;
    button.addEventListener('click', () => handleInput(letter, button));
    keyboardContainer.appendChild(button);
  });
}

// Função para lidar com a entrada do teclado virtual e físico
function handleInput(key, button) {
  if (gameOver) return; // Não permitir entradas após o término do jogo
  
  key = key.toUpperCase();
  if (!corrects.includes(key) && /^[A-Z]+$/.test(key)) {
    if (word.includes(key)) {
      for (let i = 0; i < word.length; i++) {
        if (word[i] === key) {
          corrects.push(key);
          inputs.querySelectorAll("input")[i].value = key;
        }
      }
      // Mudar o fundo para verde escuro ao acertar
      if (button) {
        button.style.backgroundColor = '#22543d'; // verde escuro
        button.style.color = '#fff'; // texto branco
      }
    } else if (!incorrects.includes(key)) {
      incorrects.push(key);
      maxGuesses--;
    
      // Mudar o fundo do botão para vermelho ao errar
      if (button) {
        button.style.backgroundColor = '#ff4c4c'; // vermelho
        button.style.color = '#fff'; // texto branco
      }
    
      // Alterar a cor do ícone de planeta para vermelho na ordem
      const planetIconsContainer = document.getElementById("planet-icons");
      const remainingPlanets = planetIconsContainer.children;
      if (remainingPlanets.length > incorrects.length - 1) {
        const currentPlanet = remainingPlanets[incorrects.length - 1];
        currentPlanet.style.color = '#ff4c4c'; // vermelho
      }
    
      // Verifica se todas as tentativas se esgotaram
      if (maxGuesses < 1) {
        pauseTime();
        showResult(false); // Mostra o resultado de perda
        for (let i = 0; i < word.length; i++) {
          inputs.querySelectorAll("input")[i].value = word[i];
        }
      }
    }
  }

  // Desabilitar e marcar o botão após ser clicado
  if (button) {
    button.disabled = true;
    button.classList.add('disabled-button');
  }

  setTimeout(() => {
    if (corrects.length === word.length) {
      pauseTime();
      showResult(true); 
    } else if (maxGuesses < 1) {
      pauseTime();
      showResult(false); 
      for (let i = 0; i < word.length; i++) {
        inputs.querySelectorAll("input")[i].value = word[i];
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createKeyboard();
  typingInput.addEventListener("input", (e) => handleInput(e.target.value));
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      const button = Array.from(document.querySelectorAll('.keyboard-container button'))
        .find(btn => btn.innerText === key);
      handleInput(key, button);
    }
  });
  typingInput.focus(); // Definir o foco automaticamente ao carregar a página
});

function randomWord() {
  gameOver = false; // Reiniciar o estado de jogo
  startTime();
  let ranObj = wordList[Math.floor(Math.random() * wordList.length)];
  word = ranObj.word.toUpperCase();  
  maxGuesses = 5;
  corrects = [];
  incorrects = [];

  hint.innerText = ranObj.hint;
  
  // Adicionar os ícones de planeta
  const planetIconsContainer = document.getElementById("planet-icons");
  planetIconsContainer.innerHTML = ''; // Limpa os ícones anteriores
  for (let i = 0; i < maxGuesses; i++) {
    const planetIcon = document.createElement('i');
    planetIcon.className = 'fa-solid fa-earth-americas';
    planetIcon.style.color = '#4caf50'; // cor padrão verde
    planetIconsContainer.appendChild(planetIcon);
  }

  let html = "";
  for (let i = 0; i < word.length; i++) {
    html += `<input type="text" disabled>`;
  }
  inputs.innerHTML = html;
}

randomWord();

async function saveRecord(time, incorrects) {
  try {
    let res;
    const response = await fetch("http://localhost:3000/api/record/hangame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"tempo_record": time, "quantidade_erros": incorrects}),
      credentials: "include",
    });

    res = await response.json();
    console.log(res)
  } catch (error) {
    console.log(error);
  }
}

function showResult(won) { 
  gameOver = true; // Marcar o jogo como terminado
  gameContent.style.display = "none";
  resultContainer.style.display = "flex";
  totalErrors.innerText = incorrects.length;
  totalTime.innerText = calculateTime(time);

  if (won) {
    saveRecord(time, incorrects.length); // Enviando tempo em milissegundos
    resultMessage.innerText = "Parabéns! Você ganhou!";
  } else {
    resultMessage.innerText = "Que pena! Você perdeu. Tente novamente!";
  }
}

function resetGame() {
  resultContainer.style.display = "none";
  gameContent.style.display = "block";
  stopTime();
  randomWord();
  createKeyboard(); // Recria o teclado
  typingInput.focus(); // Definir o foco automaticamente ao resetar o jogo
}

resetBtns.forEach(btn => btn.addEventListener("click", (e) => {
  e.preventDefault();
  resetGame();
}));

inputs.addEventListener("click", () => typingInput.focus());
document.addEventListener("keydown", () => typingInput.focus());

function showHelp() {
  const blurOverlay = document.getElementById('blur-overlay');
  const helpDialog = document.getElementById('help-dialog');

  blurOverlay.style.display = 'block';
  helpDialog.style.display = 'flex';
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
