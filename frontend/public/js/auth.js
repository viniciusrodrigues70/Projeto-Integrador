(() => {
  const API_BASE = "http://localhost:3000/api";
  const TOKEN_KEY = "bancoSolidarioToken";
  const USER_KEY = "bancoSolidarioUsuario";
  async function api(path, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(API_BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.mensagem || "Não foi possível concluir a solicitação.");
    return data;
  }
  function mensagem(element, texto, erro = false) {
    if (!element) return;
    element.textContent = texto;
    element.hidden = !texto;
    element.classList.toggle("error", erro);
    element.classList.toggle("success", !erro);
  }
  function salvarSessao(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  }
  function atualizarPerfil(usuario) {
    const perfil = document.querySelector(".profile");
    if (!perfil || !usuario) return;
    const avatar = perfil.querySelector(".avatar");
    const nome = perfil.querySelector("strong");
    const tipo = perfil.querySelector("small");
    const iniciais = String(usuario.nome || "Usuário")
      .trim().split(/\s+/).slice(0, 2).map((parte) => Array.from(parte)[0]).join("").toUpperCase();
    const tipos = { ADMINISTRADOR: "Administrador", OPERADOR: "Operador" };
    if (avatar) avatar.textContent = iniciais || "US";
    if (nome) nome.textContent = usuario.nome || "Usuário";
    if (tipo) tipo.textContent = tipos[usuario.tipo] || usuario.tipo || "Conta";
  }
  async function sair() {
    try { await api("/auth/logout", { method: "POST" }); } catch (_) {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "login.html";
  }
  window.BancoAuth = { api, mensagem, salvarSessao, TOKEN_KEY, USER_KEY, sair };
  document.querySelectorAll(".auth-logout").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); sair(); }));
  if (document.body.classList.contains("auth-protected")) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { window.location.replace("login.html"); return; }
    try { atualizarPerfil(JSON.parse(localStorage.getItem(USER_KEY) || "null")); } catch (_) {}
    api("/auth/me").then((data) => {
      localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
      atualizarPerfil(data.usuario);
    }).catch(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace("login.html");
    });
  }
})();