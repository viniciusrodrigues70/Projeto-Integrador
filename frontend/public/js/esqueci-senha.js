(() => {
  const form = document.getElementById("recuperacao-form");
  if (!form) return;
  const status = document.getElementById("mensagem");
  const botao = form.querySelector('[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    botao.disabled = true;
    form.setAttribute("aria-busy", "true");
    BancoAuth.mensagem(status, "");

    try {
      const resposta = await BancoAuth.api("/auth/esqueci-senha", {
        method: "POST",
        body: JSON.stringify({ email: form.elements.email.value.trim() })
      });
      if (resposta.linkDesenvolvimento) {
        const link = document.createElement("a");
        link.href = resposta.linkDesenvolvimento;
        link.textContent = "Abrir link de redefinição (modo de desenvolvimento)";
        link.className = "auth-dev-link";
        status.replaceChildren(document.createTextNode(resposta.mensagem + " "), link);
        status.hidden = false;
        status.classList.remove("error");
        status.classList.add("success");
      } else {
        BancoAuth.mensagem(status, resposta.mensagem || "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.");
      }
    } catch (error) {
      BancoAuth.mensagem(status, error.message || "Não foi possível solicitar a redefinição. Tente novamente.", true);
    } finally {
      botao.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
})();