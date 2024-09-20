const BASE_URL = "https://sustenteco.onrender.com";
let user = null;

// Função para verificar se o usuário está autenticado
export async function isAuthenticated() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token não encontrado");
    }

    const response = await fetch(`${BASE_URL}/api/isLogged`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Passa o token no header
      },
    });

    if (!response.ok) {
      throw new Error("Usuário não autenticado");
    }

    user = await response.json();
    return true;
    
  } catch (error) {
    console.log(error);
    user = null;
    return false;
  }
}

// Função para obter os dados do usuário
export const getUser = () => user;

// Função para realizar login e armazenar o token
export async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token); // Armazenar o token no localStorage
      return true;
    } else {
      throw new Error(data.message || "Falha na autenticação");
    }
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    return false;
  }
}

// Função para realizar logout e remover o token
export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/src/telas/login/index.html"; // Redirecionar para a página de login
}
