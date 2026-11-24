<<<<<<< HEAD

(function () {
    const tbody = document.querySelector(".table-container tbody");

    if (!tbody) {
        return;
    }

    tbody.replaceChildren();

    const aviso = document.createElement("div");

    aviso.className = "notice";

    const painel = tbody.closest(".panel");
    const tabela = tbody.closest(".table-container");

    painel?.insertBefore(aviso, tabela);

    async function carregar() {
        try {
            const produtos = await BancoAuth.api("/produtos");

            tbody.replaceChildren();

            for (const produto of produtos) {
                const linha = document.createElement("tr");

                const valores = [
                    produto.id_produto,
                    produto.nome,
                    produto.descricao,
                    produto.peso ?? "—",
                    produto.categoria,
                    produto.quantidade
                ];

                for (const valor of valores) {
                    const celula = document.createElement("td");

                    celula.textContent = String(valor ?? "—");

                    linha.appendChild(celula);
                }

                tbody.appendChild(linha);
            }

            aviso.hidden = true;

            if (produtos.length === 0) {
                const linha = document.createElement("tr");

                linha.innerHTML = `
                    <td colspan="6" class="empty-state">
                        Nenhum produto cadastrado.
                    </td>
                `;

                tbody.appendChild(linha);
            }

        } catch (error) {
            aviso.textContent = `Não foi possível carregar os produtos: ${error.message}`;
            aviso.hidden = false;
        }
    }

    carregar();
})();
=======
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
>>>>>>> f3023f5377c6b05559cd679ab40c95c33d6576cc
