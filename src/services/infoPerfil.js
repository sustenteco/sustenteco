let info = null;

export async function getInfo() {
  try {
    const access_token = localStorage.getItem("token");
    if (!access_token) {
      console.log("Token não encontrado");
      return false;
    }
    const response = await fetch("https://sustenteco.onrender.com/api/perfil/info", {
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
    info = await response.json();
    return info;
    
  } catch (error) {
    console.log(error);
    info = null;
    return info;
  }
}

