(async () => {
  const tabela = document.querySelector(".table-container tbody");
  if (!tabela) return;

  try {
    const entregas = await BancoAuth.api("/entregas");
    tabela.replaceChildren();

    entregas.forEach((entrega) => {
      const linha = document.createElement("tr");
      const data = String(entrega.data_entrega).slice(0, 10);
      const valores = [
        entrega.id_entrega,
        entrega.nome_responsavel,
        new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR"),
        entrega.itens || "—",
        "—",
        entrega.observacao || "—",
        "Concluída",
      ];

      valores.forEach((valor, indice) => {
        const celula = document.createElement("td");

        if (indice === 6) {
          const status = document.createElement("span");
          status.className = "status";
          status.textContent = valor;
          celula.appendChild(status);
        } else {
          celula.textContent = valor ?? "—";
        }

        linha.appendChild(celula);
      });

      tabela.appendChild(linha);
    });

    const numeros = document.querySelectorAll(".stats .stat-number");
    if (numeros[0]) numeros[0].textContent = String(entregas.length);
    if (numeros[1]) {
      numeros[1].textContent = String(
        new Set(entregas.map((e) => e.id_familia)).size
      );
    }
  } catch (erro) {
    alert("Não foi possível carregar as entregas: " + erro.message);
  }
})();
