import { requireAuth } from '../../utils/middleware.js';
import { getUser } from '../../utils/auth.js';

document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  const user = getUser();
  if (user) {
    updateUI(user);
  }

  handleSidebarVisibility();

  const sidebar = document.querySelector('.sidebar');
  const spanLogout = document.getElementById('spanLogout')
  const liGoToPerfil = document.getElementById('liGoToPerfil');
  const liGotoRanking = document.getElementById('liGotoRanking');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const gameOptions = document.querySelectorAll('.game-option');

  const gameContainer = document.getElementById('game-container');
  const exitGameModal = document.getElementById('exitGameModal');
  const btnConfirmExit = document.getElementById('btnConfirmExit');
  const btnCancelExit = document.getElementById('btnCancelExit');

  let isGameActive = false;
  let isGamePage = false; // Para controlar se estamos em uma página de jogo
  let currentContent = 'perfil'; // Para rastrear o conteúdo atual (inicia com 'perfil')
  let pendingNavigation = null;

  window.addEventListener('resize', handleSidebarVisibility);

  spanLogout.addEventListener('click', () => {
  localStorage.removeItem("token");
    handleExitNavigation('login');
  });

  liGoToPerfil.addEventListener('click', () => {
    handleExitNavigation('perfil');
  });

  liGotoRanking.addEventListener('click', () => {
    handleExitNavigation('ranking');
  });

  gameOptions.forEach(option => {
    option.addEventListener('click', () => {
      const game = option.getAttribute('data-game');
      handleExitNavigation(game);
    });
  });

  btnToggleSidebar.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  function handleExitNavigation(destination) {
    // Se estamos em um jogo e o destino é perfil ou ranking, exibir o modal de saída
    if (isGamePage && (destination === 'perfil' || destination === 'ranking')) {
      pendingNavigation = destination;
      showExitModal();
    } 
    // Se a navegação é entre perfil e ranking, permita navegação direta
    else if ((currentContent === 'perfil' && destination === 'ranking') ||
             (currentContent === 'ranking' && destination === 'perfil')) {
      navigateTo(destination);
    }
    // Se estamos em um jogo e o destino é outro jogo, exibir o modal de saída
    else if (isGamePage && destination !== currentContent) {
      pendingNavigation = destination;
      showExitModal();
    } 
    // Navegação direta para qualquer outra opção
    else {
      navigateTo(destination);
    }
  }

  function navigateTo(destination) {
    loadContent(destination);
    sidebar.classList.remove('open'); // Fecha a sidebar ao trocar de jogo ou página
  }

  function showExitModal() {
    exitGameModal.style.display = 'block';
  }

  function closeExitModal() {
    exitGameModal.style.display = 'none';
  }

  btnConfirmExit.addEventListener('click', () => {
    closeExitModal();
    isGameActive = false; // Reset estado do jogo
    isGamePage = false; // Não está mais em uma página de jogo
    navigateTo(pendingNavigation); // Navegar para o destino pendente
    pendingNavigation = null; // Limpar o destino pendente
  });

  btnCancelExit.addEventListener('click', () => {
    closeExitModal(); // Apenas fecha o modal
  });

  function loadContent(destination) {
    isGameActive = (destination === 'cacapalavras' || destination === 'hangame' || destination === 'ecopuzzle' || destination === 'quiz');
    isGamePage = isGameActive;  // Atualiza o estado da página de jogo

    gameContainer.innerHTML = '';  // Limpa o container de conteúdo

    let iframeSrc = '';
    switch (destination) {
      case 'cacapalavras':
        iframeSrc = "../../jogos/cacapalavras/index.html";
        break;
      case 'hangame':
        iframeSrc = "../../jogos/forca/index.html";
        break;
      case 'ecopuzzle':
        iframeSrc = "../../jogos/ecopuzzle/index.html";
        break;
      case 'quiz':
        iframeSrc = "../../jogos/quiz/index.html";
        break;
      case 'perfil':
        iframeSrc = "../perfil/index.html";
        break;
      case 'ranking':
        iframeSrc = "../ranking/index.html";
        break;
      case 'login':
        window.location.href = "/src/telas/login/index.html"
        break;
      default:
        gameContainer.innerHTML = '<h2>Selecione uma opção na barra lateral</h2>';
        isGameActive = false;
        isGamePage = false;
        return;
    }

    gameContainer.innerHTML = `
      <iframe id="content-iframe" src="${iframeSrc}" style="width: 100%; height: 100%; border: none;"></iframe>
    `;

    currentContent = destination;
  }
});

const updateUI = (user) => {
  document.getElementById('msgOla').innerText = `${user.name}`;
};

function handleSidebarVisibility() {
  const sidebar = document.querySelector('.sidebar');
  if (window.innerWidth < 1000) {
    sidebar.classList.remove('open');
  } else {
    sidebar.classList.add('open');
  }
}

// Carrossel
let currentSlide = 0;
let startX;
let isDragging = false;
let slideInterval;

function showSlide(slideIndex, carousel) {
  const slides = document.querySelectorAll(carousel + ' .carousel-item');
  const indicators = document.querySelectorAll('.carousel-indicators .indicator');

  if (slideIndex >= slides.length) {
    currentSlide = 0;
  } else if (slideIndex < 0) {
    currentSlide = slides.length - 1;
  } else {
    currentSlide = slideIndex;
  }

  slides.forEach((slide) => {
    slide.style.transform = `translateX(${-currentSlide * 100}%)`;
  });

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlide);
  });
}

function nextSlide() {
  const carousel = window.innerWidth >= 1000 ? '.desktop-carousel' : '.mobile-carousel';
  showSlide(currentSlide + 1, carousel);
}

function goToSlide(slideIndex) {
  const carousel = window.innerWidth >= 1000 ? '.desktop-carousel' : '.mobile-carousel';
  showSlide(slideIndex, carousel);
}

function startSlideShow() {
  slideInterval = setInterval(nextSlide, 5000);
}

function stopSlideShow() {
  clearInterval(slideInterval);
}

function handleTouchStart(event) {
  startX = event.touches[0].clientX;
  isDragging = true;
  stopSlideShow();
}

function handleTouchMove(event) {
  if (!isDragging) return;
  const currentX = event.touches[0].clientX;
  const diffX = startX - currentX;

  const carousel = window.innerWidth >= 1000 ? '.desktop-carousel' : '.mobile-carousel';
  if (diffX > 50) {
    nextSlide();
    isDragging = false;
  } else if (diffX < -50) {
    currentSlide--;
    const slides = document.querySelectorAll(carousel + ' .carousel-item');
    currentSlide = currentSlide < 0 ? slides.length - 1 : currentSlide;
    showSlide(currentSlide, carousel);
    isDragging = false;
  }
}

function handleTouchEnd() {
  isDragging = false;
  startSlideShow();
}

// Inicializa o carrossel ao carregar a página
window.addEventListener('load', () => {
  const carousel = window.innerWidth >= 1000 ? '.desktop-carousel' : '.mobile-carousel';
  showSlide(currentSlide, carousel);
  startSlideShow();

  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    carousel.addEventListener('touchstart', handleTouchStart);
    carousel.addEventListener('touchmove', handleTouchMove);
    carousel.addEventListener('touchend', handleTouchEnd);
  });
});

// Atualiza o carrossel ao redimensionar a janela
window.addEventListener('resize', () => {
  const carousel = window.innerWidth >= 1000 ? '.desktop-carousel' : '.mobile-carousel';
  showSlide(currentSlide, carousel);
});