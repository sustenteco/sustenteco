// Exibe o popup de "Como Jogar" ao iniciar a página
document.addEventListener("DOMContentLoaded", () => {
    showHelp();
  });

function startGame() {
    closeHelp(); // Fecha o popup de ajuda
    const quizContainer = document.getElementById('quiz-container');
    const quizContainerWrapper = document.getElementById('quiz-wrapper');
    const resultContainer = document.getElementById('result-container');
    const quizContainerQuestions = document.getElementById('quiz-container-questions');
    const headerQuizContainer = document.getElementById('header-quiz');

    // Resetando variáveis para um novo jogo
    currentQuestion = 0;
    score = 0;
    questionTimes = [];
    totalTimeSpent = 0; // Reseta o tempo total gasto para o novo jogo
    selectedQuestions = shuffleQuestions(questions).slice(0, 5);

    resultContainer.style.display = 'none';
    quizContainerWrapper.style.display = 'flex';
    quizContainerQuestions.style.display = 'flex';
    quizContainer.style.display = 'flex';
    headerQuizContainer.style.display = 'flex'; // Mostrar cabeçalho novamente se estiver escondido
    document.getElementById('next-button').style.display = 'none'; // Esconder botão de próxima pergunta

    createProgressPlanets(); // Cria os planetas de progresso
    loadQuestion();
}

  function createProgressPlanets() {
        const progressContainer = document.getElementById('progress-container');
        progressContainer.innerHTML = ''; // Limpa o contêiner de progresso

        selectedQuestions.forEach((_, index) => {
            const planet = document.createElement('div');
            planet.classList.add('planet');
            planet.setAttribute('id', `planet-${index}`); // Adiciona um ID único para cada planeta
            progressContainer.appendChild(planet);
        });
    }

    function updateProgressPlanet(index, isCorrect) {
        const planet = document.getElementById(`planet-${index}`);
        if (isCorrect) {
            planet.style.backgroundColor = '#4caf50'; // Verde para resposta correta
        } else {
            planet.style.backgroundColor = '#e74c3c'; // Vermelho para resposta incorreta
        }
    }
  
  function animateOptions() {
    const options = document.querySelectorAll('.option');
  
    options.forEach((option, index) => {
        setTimeout(() => {
            option.style.opacity = '1';
        }, index * 100);
    });
  }

  const questions = [
    // ODS 1: Erradicação da Pobreza
    {
        question: "Qual é uma maneira eficaz de combater a pobreza extrema?",
        options: ["Aumentar impostos sobre os pobres", "Reduzir o salário mínimo", "Aumentar a jornada de trabalho", "Investir em educação e saúde"],
        correctAnswer: 3,
        explanation: "Investir em educação e saúde ajuda a combater a pobreza extrema, proporcionando melhores oportunidades e qualidade de vida."
    },
    {
        question: "Qual medida pode ajudar a erradicar a pobreza?",
        options: ["Criar mais empregos formais", "Reduzir o salário mínimo", "Aumentar a carga tributária sobre os pobres", "Diminuir o acesso à educação"],
        correctAnswer: 0,
        explanation: "Criar mais empregos formais proporciona renda e estabilidade financeira, ajudando a erradicar a pobreza."
    },
  
    // ODS 2: Fome Zero e Agricultura Sustentável
    {
        question: "Qual é uma prática sustentável para acabar com a fome?",
        options: ["Promover a agricultura sustentável", "Desmatar florestas para agricultura", "Desperdiçar alimentos", "Aumentar a produção de alimentos ultraprocessados"],
        correctAnswer: 0,
        explanation: "Promover a agricultura sustentável é essencial para acabar com a fome, garantindo a produção de alimentos de maneira responsável e duradoura."
    },
    {
        question: "O que pode melhorar a nutrição das crianças em idade escolar?",
        options: ["Reduzir a diversidade alimentar", "Promover a agricultura sustentável", "Desestimulando a agricultura familiar", "Aumentando o acesso a alimentos ultraprocessados"],
        correctAnswer: 1,
        explanation: "Promover a agricultura sustentável garante acesso a alimentos nutritivos e de qualidade para crianças em idade escolar."
    },
  
    // ODS 3: Saúde e Bem-estar
    {
        question: "O que pode melhorar a saúde materna?",
        options: ["Reduzir o acesso a cuidados pré-natais", "Promover partos domiciliares sem assistência", "Aumentar a carga de trabalho das gestantes", "Garantir acesso a cuidados de saúde de qualidade"],
        correctAnswer: 3,
        explanation: "Garantir acesso a cuidados de saúde de qualidade melhora significativamente a saúde materna, reduzindo riscos durante a gravidez e o parto."
    },
    {
        question: "O que pode reduzir a mortalidade infantil?",
        options: ["Reduzir o número de médicos", "Garantir acesso a cuidados de saúde para mães e crianças", "Aumentar a poluição", "Cortar programas de vacinação"],
        correctAnswer: 1,
        explanation: "Garantir acesso a cuidados de saúde para mães e crianças é crucial para reduzir a mortalidade infantil e melhorar a saúde da próxima geração."
    },
    {
        question: "O que pode melhorar a saúde pública?",
        options: ["Ignorar a prevenção de doenças", "Promover campanhas de vacinação", "Reduzir o acesso aos serviços de saúde", "Cortar orçamento da saúde"],
        correctAnswer: 1,
        explanation: "Promover campanhas de vacinação é fundamental para melhorar a saúde pública e prevenir doenças transmissíveis."
    },
  
    // ODS 4: Educação de Qualidade
    {
        question: "Como podemos garantir uma educação de qualidade para todos?",
        options: ["Cobrando altas mensalidades escolares", "Reduzindo o número de escolas públicas", "Privatizando todas as escolas", "Investindo em formação de professores"],
        correctAnswer: 3,
        explanation: "Investir na formação de professores garante que eles tenham as habilidades e conhecimentos necessários para oferecer uma educação de qualidade."
    },
    {
        question: "Como podemos melhorar a qualidade da educação?",
        options: ["Privatizando todas as escolas", "Reduzindo os investimentos em infraestrutura escolar", "Formando professores qualificados", "Aumentando o número de alunos por sala"],
        correctAnswer: 2,
        explanation: "Formar professores qualificados é essencial para melhorar a qualidade da educação, pois eles são os principais agentes de ensino."
    },
  
    // ODS 5: Igualdade de Gênero
    {
        question: "Qual medida pode promover a igualdade de gênero?",
        options: ["Pagar menos às mulheres", "Aumentar a participação das mulheres na política", "Restringir o acesso das mulheres à educação", "Excluir mulheres de cargos de liderança"],
        correctAnswer: 1,
        explanation: "Aumentar a participação das mulheres na política ajuda a promover a igualdade de gênero e a garantir que suas vozes sejam ouvidas em processos decisórios."
    },
    {
        question: "Qual é uma forma de empoderar as mulheres?",
        options: ["Impedir o acesso ao mercado de trabalho", "Reduzir a participação em cargos de liderança", "Restringir o acesso à educação", "Promover a igualdade salarial"],
        correctAnswer: 3,
        explanation: "Promover a igualdade salarial entre homens e mulheres é uma forma eficaz de empoderar as mulheres e promover a igualdade de gênero."
    },
    {
        question: "Como a violência de gênero pode ser combatida?",
        options: ["Fortalecendo leis de proteção às vítimas", "Ignorando o problema", "Culpando as vítimas", "Reduzindo o apoio a abrigos para mulheres"],
        correctAnswer: 0,
        explanation: "Fortalecer as leis de proteção às vítimas é crucial para combater a violência de gênero e garantir a segurança das mulheres."
    },
  
    // ODS 6: Água Potável e Saneamento
    {
        question: "Qual ação ajuda a garantir água limpa e saneamento para todos?",
        options: ["Desperdiçar água potável", "Poluir rios e lagos", "Destruir áreas de recarga de aquíferos", "Investir em infraestruturas de saneamento"],
        correctAnswer: 3,
        explanation: "Investir em infraestruturas de saneamento é crucial para garantir água limpa e reduzir doenças relacionadas à água contaminada."
    },
    {
        question: "Qual é uma prática sustentável para a gestão da água?",
        options: ["Poluir rios", "Investir em sistemas de reutilização de água", "Destruir mananciais", "Desperdiçar água"],
        correctAnswer: 1,
        explanation: "Investir em sistemas de reutilização de água ajuda a garantir a sustentabilidade dos recursos hídricos e a reduzir o desperdício."
    },
  
    // ODS 10: Redução das Desigualdades
    {
        question: "Como podemos reduzir as desigualdades sociais?",
        options: ["Aumentando os impostos para os mais pobres", "Cortando programas de assistência social", "Reduzindo o acesso à educação", "Promovendo a inclusão social e econômica"],
        correctAnswer: 3,
        explanation: "Promover a inclusão social e econômica é essencial para reduzir as desigualdades, criando oportunidades para todos."
    },
    {
        question: "Qual é uma abordagem eficaz para reduzir as desigualdades econômicas?",
        options: ["Eliminar programas de apoio social", "Reduzir o salário mínimo", "Criar políticas de inclusão social", "Aumentar os impostos sobre os mais pobres"],
        correctAnswer: 2,
        explanation: "Criar políticas de inclusão social ajuda a reduzir as desigualdades econômicas, proporcionando oportunidades iguais para todos."
    },
  
    // ODS 11: Cidades e Comunidades Sustentáveis
    {
        question: "O que pode tornar as cidades mais sustentáveis?",
        options: ["Destruir áreas verdes", "Promover a expansão desordenada", "Aumentar a poluição urbana", "Investir em transporte público"],
        correctAnswer: 3,
        explanation: "Investir em transporte público sustentável ajuda a reduzir a poluição e torna as cidades mais acessíveis e habitáveis."
    },
    {
        question: "Como podemos garantir moradias acessíveis e seguras?",
        options: ["Reduzindo investimentos em habitação", "Promovendo políticas de habitação social", "Aumentando os custos de moradia", "Desencorajando a construção de novas moradias"],
        correctAnswer: 1,
        explanation: "Promover políticas de habitação social é essencial para garantir que todos tenham acesso a moradias acessíveis e seguras."
    },
    {
        question: "O que pode melhorar a qualidade do ar nas cidades?",
        options: ["Queimar resíduos a céu aberto", "Reduzir áreas verdes", "Aumentar a poluição industrial", "Promover o uso de transporte público"],
        correctAnswer: 3,
        explanation: "Promover o uso de transporte público reduz a emissão de poluentes e melhora a qualidade do ar nas cidades."
    },
  
    // ODS 16: Paz, Justiça e Instituições Eficazes
    {
        question: "Qual é uma medida importante para promover a paz e a justiça?",
        options: ["Eliminar direitos civis", "Fortalecer as instituições públicas", "Aumentar a corrupção", "Promover a violência"],
        correctAnswer: 1,
        explanation: "Fortalecer as instituições públicas é fundamental para promover a paz, a justiça e garantir que os direitos de todos sejam respeitados."
    },
    {
        question: "O que pode fortalecer a justiça e a transparência nas instituições?",
        options: ["Implementar políticas de transparência", "Reduzir a participação pública", "Eliminar auditorias", "Aumentar a corrupção"],
        correctAnswer: 0,
        explanation: "Implementar políticas de transparência fortalece a justiça e garante que as instituições públicas operem de maneira justa e aberta."
    },
    {
        question: "Qual é uma medida importante para prevenir a violência urbana?",
        options: ["Reduzir o policiamento comunitário", "Implementar programas de inclusão social", "Destruir áreas de lazer", "Aumentar o desemprego"],
        correctAnswer: 1,
        explanation: "Implementar programas de inclusão social é importante para prevenir a violência urbana, oferecendo oportunidades e apoio a comunidades vulneráveis."
    },
    {
        question: "O que pode promover a paz em comunidades locais?",
        options: ["Reduzir programas de mediação de conflitos", "Aumentar as desigualdades", "Fortalecer o diálogo comunitário", "Promover divisões sociais"],
        correctAnswer: 2,
        explanation: "Fortalecer o diálogo comunitário promove a paz e ajuda a resolver conflitos de maneira pacífica e colaborativa."
    }
  ];
  
  let selectedQuestions = shuffleQuestions(questions).slice(0, 5); // Escolhe aleatoriamente 5 perguntas
  const timeLimit = 32; // Tempo limite por pergunta em segundos
  let timerInterval; // Variável para armazenar o intervalo do cronômetro
  let currentTime; // Variável para armazenar o tempo restante
  let totalTimeSpent = 0; // Variável para armazenar o tempo total em milissegundos
  let time = 32 * 1000;
  const timerElement = document.getElementById('timer');
  
  // Função para embaralhar as perguntas
  function shuffleQuestions(questionsArray) {
    return questionsArray.sort(() => Math.random() - 0.5);
  }
  
  let currentQuestion = 0;
  let score = 0;
  let questionTimes = []; // Array para armazenar o tempo de cada pergunta
  
  function loadQuestion() {
    const timerElement = document.getElementById('timer');
    const questionContainer = document.getElementById('question-container');
    const optionsContainer = document.getElementById('options-container');
    const resultContainer = document.getElementById('result');
    const nextButton = document.getElementById('next-button');
  
    startTimer(); // Inicia o cronômetro ao carregar uma nova pergunta
  
    questionContainer.textContent = selectedQuestions[currentQuestion].question;
  
    optionsContainer.innerHTML = "";
    selectedQuestions[currentQuestion].options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => checkAnswer(index));
        optionsContainer.appendChild(button);
    });
  
    resultContainer.textContent = "";
    nextButton.style.display = "none";
  }
  
  function startTimer() {
    let startTime = Date.now();

    timerInterval = setInterval(() => {
      let elapsedTime = Date.now() - startTime;
      let remainingTime = time - elapsedTime;
  
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        remainingTime = 0; // Para evitar números negativos
        checkAnswer(-1); // Resposta incorreta (tempo esgotado)
      }
      currentTime = remainingTime;
      timerElement.textContent = `Tempo: ${calculateTime(remainingTime)}`;
    }, 1000);
  }

  
  function calculateTime(time) {
    let totalSeconds = Math.floor(time / 1000);
    let totalMinutes = Math.floor(totalSeconds / 60);
  
    let displaySeconds = (totalSeconds % 60).toString().padStart(2, "0");
    let displayMinutes = totalMinutes.toString().padStart(2, "0");
  
    return `${displayMinutes}:${displaySeconds}`;
  }
  
  function checkAnswer(selectedOption) {
    const correctAnswer = selectedQuestions[currentQuestion].correctAnswer;
    const resultContainer = document.getElementById('result');
    const nextButton = document.getElementById('next-button');
    const options = document.querySelectorAll('.option');

    clearInterval(timerInterval); // Para o cronômetro ao verificar a resposta

    options.forEach((option, index) => {
        option.disabled = true;
        if (index === correctAnswer) {
            option.classList.add('correct');
            option.classList.add('correct-answer');
        } else {
            option.classList.add('incorrect');
            option.classList.add('incorrect-answer');
        }
        option.disabled = true; // Desabilita os botões após a resposta
    });

    const questionTime = timeLimit * 1000 - currentTime;
    questionTimes.push(questionTime); // Armazena o tempo da pergunta
    totalTimeSpent += questionTime; // Acumula o tempo total gasto

    if (selectedOption === correctAnswer) {
        resultContainer.style.color = '#4caf50';
        resultContainer.textContent = `Resposta correta! ${selectedQuestions[currentQuestion].explanation}`;
        score++;
        updateProgressPlanet(currentQuestion, true); // Atualiza o planeta para verde
    } else if (selectedOption === -1) {
        resultContainer.style.color = 'orange';
        resultContainer.textContent = `Tempo esgotado! A resposta correta seria a opção ${correctAnswer + 1}. ${selectedQuestions[currentQuestion].explanation}`;
        updateProgressPlanet(currentQuestion, false); // Atualiza o planeta para vermelho
    } else {
        resultContainer.style.color = '#e74c3c';
        resultContainer.textContent = `Resposta incorreta. A resposta correta seria a opção ${correctAnswer + 1}. ${selectedQuestions[currentQuestion].explanation}`;
        updateProgressPlanet(currentQuestion, false); // Atualiza o planeta para vermelho
    }

    nextButton.style.display = "flex";
}
  
  function nextQuestion() {
    const options = document.querySelectorAll('.option');
  
    options.forEach((option) => {
        option.classList.remove('correct', 'incorrect');
        option.disabled = false; // Habilita os botões para a próxima pergunta
    });
  
    currentQuestion++;
  
    if (currentQuestion < selectedQuestions.length) {
        loadQuestion();
    } else {
        clearInterval(timerInterval);
        showFinalResult();
    }
  }
  
  async function saveRecord(time, incorrects) {
      try {
        const access_token = localStorage.getItem("token");
        if (!access_token) {
          console.log("Token não encontrado");
          return false;
        }
        let res;
        const response = await fetch("http://localhost:3000/api/record/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
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
  
  function showFinalResult() {
    const quizContainerQuestions = document.getElementById('quiz-container-questions');
    const quizContainerWrapper = document.getElementById('quiz-container')
    const resultContainer = document.getElementById('result-container');
    const headerQuizContainer = document.getElementById('header-quiz');
    const correctAnswersElement = document.getElementById('correct-answers');
    const incorrectAnswersElement = document.getElementById('incorrect-answers');
    const percentageElement = document.getElementById('percentage');
    const totalScoreElement = document.getElementById('total-score');
    const totalTimeElement = document.getElementById('total-time');
  
    quizContainerQuestions.style.display = 'none'; // Oculta o container de perguntas
    headerQuizContainer.style.display = 'none';
    quizContainerWrapper.style.display = 'none';
    resultContainer.style.display = 'flex';
    correctAnswersElement.textContent = score;
    incorrectAnswersElement.textContent = selectedQuestions.length - score;
    let incorrect = selectedQuestions.length - score;    
    percentageElement.textContent = ((score / selectedQuestions.length) * 100).toFixed(2) + '%';
    totalScoreElement.textContent = `${score} / ${selectedQuestions.length}`;
    totalTimeElement.textContent = calculateTime(totalTimeSpent); // Exibe o tempo total em MM:SS
    saveRecord(totalTimeSpent, incorrect); // Envia o tempo total em milissegundos para a API
  }
  
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
  