const BASE_URL = "https://sustenteco.onrender.com"

let user = null;

export async function isAuthenticated() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/isLogged`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      // credentials: "include", // Não é necessário para JWT
    });

    if (!response.ok) {
      throw new Error("Usuário não autenticado");
    }
    user = await response.json();
    return true;
    
  } catch (error) {
    console.log(error);
    user = null;
    localStorage.removeItem("token"); // Remove o token se não for válido
    return false;
  }
}

export const getUser = () => user;
