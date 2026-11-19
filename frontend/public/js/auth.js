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
  function adicionarControlesDeSenha() {
    const olho = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    const olhoFechado = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 3 18 18"></path><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8"></path><path d="M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"></path></svg>';
    document.querySelectorAll('input[type="password"]').forEach((input) => {
      const campo = document.createElement("div");
      campo.className = "password-field";
      input.parentNode.insertBefore(campo, input);
      campo.appendChild(input);

      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "password-toggle";
      botao.setAttribute("aria-label", "Mostrar senha");
      botao.setAttribute("aria-pressed", "false");
      botao.title = "Mostrar senha";
      botao.innerHTML = olho;
      botao.addEventListener("click", () => {
        const mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
        botao.setAttribute("aria-pressed", String(mostrar));
        botao.title = mostrar ? "Ocultar senha" : "Mostrar senha";
        botao.innerHTML = mostrar ? olhoFechado : olho;
        input.focus();
      });
      campo.appendChild(botao);
    });
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
  adicionarControlesDeSenha();
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