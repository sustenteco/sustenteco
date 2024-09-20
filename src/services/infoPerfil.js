const BASE_URL = "https://sustenteco.onrender.com"

let info = null;

export async function getInfo() {
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(`${BASE_URL}/api/perfil/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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

