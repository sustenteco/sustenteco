const BASE_URL = "https://sustenteco.onrender.com"

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const spinner = document.querySelector(".spinner");
    const message = document.querySelector(".message");
    const submitButton = document.querySelector("button[type='submit']");
    const snackbar = document.getElementById("snackbar");

    spinner.style.display = "block";
    submitButton.disabled = true;
    submitButton.classList.add('loading'); // Adiciona classe de carregamento ao botão
    message.style.display = "none";

    fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Pode ser removido se não for necessário
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        spinner.style.display = "none";
        submitButton.disabled = false;
        submitButton.classList.remove('loading'); // Remove classe de carregamento
        if (data.token) { // Verifica se o token foi recebido
          showSnackbar("Login bem-sucedido!", "success");
          localStorage.setItem("token", data.token);
          setTimeout(() => {
            window.location.href = "/src/telas/home/index.html";
          }, 1000);
        } else {
          showSnackbar("Credenciais inválidas. Por favor, tente novamente.", "error");
        }
      })
      .catch((error) => {
        spinner.style.display = "none";
        submitButton.disabled = false;
        submitButton.classList.remove('loading'); // Remove classe de carregamento
        showSnackbar("Erro ao fazer login: " + error.message, "error");
        console.error("Erro ao fazer login:", error);
      });

    function showSnackbar(message, type) {
      snackbar.textContent = message;
      snackbar.style.backgroundColor = type === "success" ? "green" : "red";
      snackbar.className = "snackbar show";
      setTimeout(() => {
        snackbar.className = snackbar.className.replace("show", "");
      }, 3000);
    }
  });

// Toggle de visibilidade da senha
document.getElementById('toggle-password').addEventListener('click', function () {
  const passwordInput = document.getElementById('login-password');
  const icon = this;
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
});

// Abrir modal de recuperação de senha
document.getElementById('forgot-password').addEventListener('click', function () {
  document.getElementById('password-recovery-modal').style.display = 'flex';
});

// Fechar modal de recuperação de senha
document.getElementById('close-modal').addEventListener('click', function () {
  document.getElementById('password-recovery-modal').style.display = 'none';
});

// Enviar código de recuperação
document.getElementById('send-code-btn').addEventListener('click', function () {
  const email = document.getElementById('recovery-email').value;

  fetch(`${BASE_URL}/api/users/send-recovery-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      document.getElementById('email-step').style.display = 'none';
      document.getElementById('code-step').style.display = 'flex';
    })
    .catch(error => {
      console.error('Erro ao enviar o código de recuperação:', error);
    });
});

// Verificar código de recuperação
document.getElementById('verify-code-btn').addEventListener('click', function () {
  const email = document.getElementById('recovery-email').value;
  const code = document.getElementById('verification-code').value;

  if (!email || !code) {
    alert('Por favor, preencha o email e o código de verificação.');
    return;
  }

  fetch(`${BASE_URL}/api/users/verify-recovery-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        alert('Código verificado com sucesso! Agora você pode redefinir sua senha.');
        document.getElementById('password-recovery-modal').style.display = 'none';
        document.getElementById('password-reset-modal').style.display = 'flex';
      } else {
        alert('Código inválido. Por favor, tente novamente.');
      }
    })
    .catch(error => {
      console.error('Erro ao verificar o código de recuperação:', error);
    });
});  

// Resetar senha
document.getElementById('reset-password-btn').addEventListener('click', function () {
  const email = document.getElementById('recovery-email').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert('As senhas não coincidem. Por favor, tente novamente.');
    return;
  }

  fetch(`${BASE_URL}/api/users/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, newPassword }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Senha redefinida com sucesso!');
        document.getElementById('password-reset-modal').style.display = 'none';
      } else {
        alert('Erro ao redefinir senha. Por favor, tente novamente.');
      }
    })
    .catch(error => {
      console.error('Erro ao redefinir senha:', error);
    });
});

// Fechar o modal de redefinição de senha
document.getElementById('close-reset-modal').addEventListener('click', function () {
  document.getElementById('password-reset-modal').style.display = 'none';
});
