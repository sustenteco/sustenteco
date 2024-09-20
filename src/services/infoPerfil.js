let info = null;

export async function getInfo() {
  try {
    const response = await fetch("http://localhost:3000/api/perfil/info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

