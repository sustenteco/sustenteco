export async function getEcopuzzleRanking() {  
  try {
    const access_token = localStorage.getItem("token");
    if (!access_token) {
      console.log("Token não encontrado");
      return false;
    }
    const response = await fetch("https://sustenteco.onrender.com/api/ranking/ecopuzzle", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      credentials: "include",
    });
    
    return await response.json();
    
  } catch (error) {
    console.log(error);
    return null;
  }
}

