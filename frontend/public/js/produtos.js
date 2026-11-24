(async () => {
  const tabela = document.querySelector(".table-container tbody");
  if (!tabela) return;

  try {
    const produtos = await BancoAuth.api("/produtos");
    tabela.replaceChildren();

    produtos.forEach((produto) => {
      const linha = document.createElement("tr");
      const valores = [
        produto.id_produto,
        produto.nome,
        produto.descricao,
        produto.peso ?? "—",
        produto.categoria,
        produto.quantidade,
      ];

      valores.forEach((valor) => {
        const celula = document.createElement("td");
        celula.textContent = valor ?? "—";
        linha.appendChild(celula);
      });

      tabela.appendChild(linha);
    });

    document.querySelectorAll(".stats .stat-number")[0].textContent =
      String(produtos.length);
  } catch (erro) {
    alert("Não foi possível carregar os produtos: " + erro.message);
  }
})();
