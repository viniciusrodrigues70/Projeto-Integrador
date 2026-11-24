(async () => {
  const tabela = document.querySelector(".table-container tbody");
  if (!tabela) return;

  try {
    const familias = await BancoAuth.api("/familias");
    tabela.replaceChildren();

    familias.forEach((familia) => {
      const linha = document.createElement("tr");

      [
        familia.id_familia,
        familia.nome_responsavel,
        familia.cpf_responsavel,
        familia.num_integrantes,
        familia.telefone || "—",
        familia.endereco,
      ].forEach((valor) => {
        const celula = document.createElement("td");
        celula.textContent = valor ?? "—";
        linha.appendChild(celula);
      });

      const celulaHistorico = document.createElement("td");
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "btn btn-light";
      botao.textContent = "Consultar";
      botao.addEventListener("click", async () => {
        try {
          const entregas = await BancoAuth.api(
            `/entregas/familia/${familia.id_familia}`
          );

          alert(
            entregas.length
              ? entregas
                  .map((e) => {
                    const data = String(e.data_entrega).slice(0, 10);
                    return `${new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")} — ${e.itens || "Entrega registrada"}`;
                  })
                  .join("\n")
              : "Essa família ainda não tem entregas registradas."
          );
        } catch (erro) {
          alert(erro.message);
        }
      });

      celulaHistorico.appendChild(botao);
      linha.appendChild(celulaHistorico);
      tabela.appendChild(linha);
    });

    const numeros = document.querySelectorAll(".stats .stat-number");
    if (numeros[0]) numeros[0].textContent = String(familias.length);
  } catch (erro) {
    alert("Não foi possível carregar as famílias: " + erro.message);
  }
})();
