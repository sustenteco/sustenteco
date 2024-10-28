let user = null;

export async function isAuthenticated() {
  try {
    const access_token = localStorage.getItem("token");
    if (!access_token) {
      console.log("Token não encontrado");
      return false;
    }

    const response = await fetch("https://sustenteco.onrender.com/api/isLogged", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      credentials: "include",
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

export const getUser = () => user;