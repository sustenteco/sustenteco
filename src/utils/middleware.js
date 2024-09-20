import { isAuthenticated } from './auth.js';

export async function requireAuth() {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    window.location.href = "../login/index.html?auth=required"; // Redireciona para a página de login
  }
}
