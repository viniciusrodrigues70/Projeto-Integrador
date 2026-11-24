document.getElementById("formDoador")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const botao = form.querySelector('[type="submit"]');

  try {
    botao.disabled = true;

    await BancoAuth.api("/doadores", {
      method: "POST",
      body: JSON.stringify({
        nome: form.nome.value.trim(),
        email: form.email.value.trim(),
        telefone: form.telefone.value.trim(),
        tipo_doador: form.tipo_doador.value,
      }),
    });

    alert("Doador cadastrado.");
    window.location.href = "doadores.html";
  } catch (erro) {
    alert(erro.message);
  } finally {
    botao.disabled = false;
  }
});