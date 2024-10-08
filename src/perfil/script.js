import { getInfo } from '../services/infoPerfil.js';

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../login/index.html?auth=required';
    return;
  }

  const info = await getInfo();
  console.log(info)
  if (info) {
    updateUI(info);
  }
window.onload = function() {
  const userName = "Usuário";
  const gamesCompleted = 0;
  const challengesWon = 0;
  const challengesLost = 0;
  const totalPlayTime = "";

  console.log(document.querySelector('.games-completed')); // Verifica se o elemento existe
  console.log(document.querySelector('.challenges-won'));
  console.log(document.querySelector('.challenges-lost'));
  console.log(document.querySelector('.total-play-time'));

  
};

  const btnGoToRanking = document.getElementById('btnGoToRanking');

  btnGoToRanking.addEventListener('click', () => {
    window.location.href = '../ranking/index.html';
  });

});

const updateUI = (info) => {
  const totalTime = convertSecondsToMinutesAndSeconds(info.tempo_total_jogos / 1000)
  document.querySelector('.perfil-info h2').innerText = info.usuario_nome;
  document.getElementById('spanJogosCompletos').innerText = info.jogos_completos;
  document.getElementById('spanDesafiosVencidos').innerText = info.desafios_vencidos;
  document.getElementById('spanTempoTotal').innerText = totalTime;
};

function convertSecondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60); // Converte para minutos
  const remainingSeconds = (seconds % 60).toFixed(2); // Calcula o restante em segundos

  return `${minutes} minutos e ${remainingSeconds} segundos`;
}
