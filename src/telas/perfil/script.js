import { requireAuth } from '../../utils/middleware.js';
import { getInfo } from '../../services/infoPerfil.js';

document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  const info = await getInfo();
  console.log(info)
  if (info) {
    updateUI(info);
  }
window.onload = function() {
  const userName = "...";
  const gamesCompleted =  0;
  const challengesWon = 0;
  const challengesLost = 0;
  const totalPlayTime = "...";

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
  const totalTime = convertSecondsToMinutesAndSeconds(info.baseInfo.tempo_total_jogos / 1000)
  document.querySelector('.perfil-info h2').innerText = info.baseInfo.usuario_nome;
  document.getElementById('spanCrossworldPosition').innerText = info.positions.crossworld? info.positions.crossworld.posicao + "º lugar" : "--"
  document.getElementById('spanHangamePosition').innerText = info.positions.hangame? info.positions.hangame.posicao + "º lugar" : "--"
document.getElementById('spanGreenGeniusPosition').innerText = info.positions.quiz? info.positions.quiz.posicao + "º lugar" : "--"
  document.getElementById('spanEcopuzzlePosition').innerText = info.positions.ecopuzzle? info.positions.ecopuzzle.posicao + "º lugar" : "--"
  document.getElementById('spanJogoMaisJogado').innerText = info.baseInfo.desafios_vencidos === 0? "--" : info.baseInfo.jogo_mais_jogado;
  document.getElementById('spanDesafiosVencidos').innerText = info.baseInfo.desafios_vencidos;
  document.getElementById('spanTempoTotal').innerText = totalTime;
};

function convertSecondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60); // Converte para minutos
  const remainingSeconds = (seconds % 60).toFixed(2); // Calcula o restante em segundos

  return `${minutes} minutos e ${remainingSeconds} segundos`;
}
