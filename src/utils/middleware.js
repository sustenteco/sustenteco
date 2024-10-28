import { isAuthenticated } from './auth.js';

export async function requireAuth() {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      window.location.href = "/src/telas/login/index.html?auth=required";
    }
  } catch (error) {
    console.error("Erro ao verificar a autenticação:", error);
    window.location.href = "/src/telas/login/index.html?auth=required";
  }
}
