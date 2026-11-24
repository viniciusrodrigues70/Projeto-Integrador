document.getElementById("formProduto")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const botao = form.querySelector('[type="submit"]');

  try {
    botao.disabled = true;

    await BancoAuth.api("/produtos", {
      method: "POST",
      body: JSON.stringify({
        nome: form.nome.value.trim(),
        descricao: form.descricao.value.trim(),
        peso: form.peso.value || null,
        categoria: form.categoria.value,
        quantidade: Number(form.quantidade.value || 0),
      }),
    });

    alert("Produto cadastrado.");
    window.location.href = "produtos.html";
  } catch (erro) {
    alert(erro.message);
  } finally {
    botao.disabled = false;
  }
});