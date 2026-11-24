document.getElementById("formFamilia")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const botao = form.querySelector('[type="submit"]');

  try {
    botao.disabled = true;

    await BancoAuth.api("/familias", {
      method: "POST",
      body: JSON.stringify({
        nome_responsavel: form.responsavel.value.trim(),
        cpf_responsavel: form.cpf.value.trim(),
        num_integrantes: Number(form.integrantes.value),
        telefone: form.telefone.value.trim(),
        endereco: form.endereco.value.trim(),
      }),
    });

    alert("Família cadastrada.");
    window.location.href = "familias.html";
  } catch (erro) {
    alert(erro.message);
  } finally {
    botao.disabled = false;
  }
});