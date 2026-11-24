<<<<<<< HEAD

(function () {
    const form = document.getElementById("formEntrega");

    if (!form) {
        return;
    }

    const familiaSelect = document.getElementById("familia");
    const itensContainer = document.getElementById("itens-entrega");

    const status = document.createElement("div");
    status.className = "auth-message";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    form.appendChild(status);

    let produtos = [];
    let familiasCarregadas = [];

    function adicionarItem() {
        const linha = document.createElement("div");

        linha.className = "form-grid item-entrega";

        linha.innerHTML = `
            <div class="form-group">
                <label>Produto</label>
                <select class="produto-entrega" required>
                    <option value="">Selecione</option>
                </select>
            </div>

            <div class="form-group">
                <label>Quantidade</label>
                <input class="quantidade-entrega" type="number" min="1" step="1" required>
            </div>

            <div class="form-group form-actions">
                <button type="button" class="btn btn-secondary remover-item-entrega">
                    Remover
                </button>
            </div>
        `;

        const select = linha.querySelector(".produto-entrega");

        for (const produto of produtos) {
            select.add(new Option(produto.nome, produto.id_produto));
        }

        const botaoRemover = linha.querySelector(".remover-item-entrega");

        botaoRemover.addEventListener("click", function () {
            if (itensContainer.children.length > 1) {
                linha.remove();
            }
        });

        itensContainer.appendChild(linha);
    }

    document.getElementById("adicionar-item-entrega").addEventListener("click", adicionarItem);

    adicionarItem();

    async function carregarOpcoes() {
        try {
            const resultados = await Promise.all([
                BancoAuth.api("/familias"),
                BancoAuth.api("/produtos")
            ]);

            const familias = resultados[0];
            produtos = resultados[1];
            familiasCarregadas = familias;

            familiaSelect.replaceChildren(
                new Option("Selecione a família", "")
            );

            for (const familia of familias) {
                familiaSelect.add(
                    new Option(
                        familia.nome_responsavel,
                        familia.id_familia
                    )
                );
            }

            const selects = itensContainer.querySelectorAll(".produto-entrega");

            for (const select of selects) {
                for (const produto of produtos) {
                    select.add(
                        new Option(produto.nome, produto.id_produto)
                    );
                }
            }

            familiaSelect.addEventListener("change", atualizarResumoFamilia);

        } catch (error) {
            BancoAuth.mensagem(
                status,
                `Não foi possível carregar famílias e produtos. ${error.message}`,
                true
            );
        }
    }

    async function atualizarResumoFamilia() {
        const familia = familiasCarregadas.find(function (item) {
            return String(item.id_familia) === familiaSelect.value;
        });

        document.getElementById("info-responsavel").value =
            familia?.nome_responsavel || "";

        document.getElementById("info-integrantes").value =
            familia ? `${familia.num_integrantes} integrantes` : "";

        const ultimaEntrega = document.getElementById("info-ultima-entrega");

        ultimaEntrega.value = "";

        if (!familia) {
            return;
        }

        try {
            const historico = await BancoAuth.api(
                `/entregas/familia/${familia.id_familia}/historico`
            );

            if (historico.length > 0) {
                ultimaEntrega.value = String(historico[0].data_entrega).slice(0, 10);
            }

        } catch (error) {
            ultimaEntrega.value = "Indisponível";
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const botao = form.querySelector('[type="submit"]');
        botao.disabled = true;

        BancoAuth.mensagem(status, "");

        const linhas = itensContainer.querySelectorAll(".item-entrega");
        const itens = [];

        for (const linha of linhas) {
            const idProduto = linha.querySelector(".produto-entrega").value;
            const quantidade = linha.querySelector(".quantidade-entrega").value;

            itens.push({
                id_produto: Number(idProduto),
                quantidade: Number(quantidade)
            });
        }

        try {
            const resposta = await BancoAuth.api("/entregas", {
                method: "POST",
                body: JSON.stringify({
                    id_familia: Number(familiaSelect.value),
                    data_entrega: document.getElementById("data").value,
                    observacao: document.getElementById("observacao").value.trim(),
                    itens: itens
                })
            });

            BancoAuth.mensagem(
                status,
                resposta.mensagem || "Entrega registrada."
            );

            window.setTimeout(function () {
                window.location.href = "entregas.html";
            }, 700);

        } catch (error) {
            BancoAuth.mensagem(
                status,
                error.message || "Não foi possível registrar a entrega.",
                true
            );

        } finally {
            botao.disabled = false;
        }
    });

    carregarOpcoes();
})();
=======
(async () => {
  const form = document.getElementById("formEntrega");
  if (!form) return;

  const campoFamilia = document.getElementById("familia");
  const campoData = document.getElementById("data");
  const campoItens = document.getElementById("itens-entrega");
  const campoObservacao = document.getElementById("observacao");

  try {
    const [familias, produtos] = await Promise.all([
      BancoAuth.api("/familias"),
      BancoAuth.api("/produtos"),
    ]);

    campoFamilia.replaceChildren(new Option("Selecione a família", ""));

    familias.forEach((familia) => {
      campoFamilia.add(new Option(
        familia.nome_responsavel,
        familia.id_familia
      ));
    });

    const hoje = new Date();
    campoData.value = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, "0"),
      String(hoje.getDate()).padStart(2, "0"),
    ].join("-");

    function adicionarItem() {
      const linha = document.createElement("div");
      linha.className = "form-grid item-entrega";

      const select = document.createElement("select");
      select.className = "produto-entrega";
      select.required = true;
      select.add(new Option("Selecione o produto", ""));

      produtos.forEach((produto) => {
        select.add(new Option(produto.nome, produto.id_produto));
      });

      const quantidade = document.createElement("input");
      quantidade.type = "number";
      quantidade.className = "quantidade-entrega";
      quantidade.min = "1";
      quantidade.placeholder = "Quantidade";
      quantidade.required = true;

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "btn btn-secondary";
      remover.textContent = "Remover";
      remover.addEventListener("click", () => linha.remove());

      linha.append(select, quantidade, remover);
      campoItens.appendChild(linha);
    }

    document
      .getElementById("adicionar-item-entrega")
      .addEventListener("click", adicionarItem);

    adicionarItem();

    campoFamilia.addEventListener("change", async () => {
      const familia = familias.find(
        (item) => String(item.id_familia) === campoFamilia.value
      );

      document.getElementById("info-responsavel").value =
        familia?.nome_responsavel || "";
      document.getElementById("info-integrantes").value =
        familia?.num_integrantes || "";

      if (familia) {
        const historico = await BancoAuth.api(
          `/entregas/familia/${familia.id_familia}`
        );
        document.getElementById("info-ultima-entrega").value =
          historico.length
            ? new Date(historico[0].data_entrega).toLocaleDateString("pt-BR")
            : "Sem entregas registradas";
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const itens = [...campoItens.querySelectorAll(".item-entrega")].map((linha) => ({
        id_produto: Number(linha.querySelector(".produto-entrega").value),
        quantidade: Number(linha.querySelector(".quantidade-entrega").value),
      }));

      const botao = form.querySelector('[type="submit"]');

      try {
        botao.disabled = true;

        await BancoAuth.api("/entregas", {
          method: "POST",
          body: JSON.stringify({
            id_familia: Number(campoFamilia.value),
            data_entrega: campoData.value,
            observacao: campoObservacao.value.trim(),
            itens,
          }),
        });

        alert("Entrega registrada e estoque atualizado.");
        window.location.href = "entregas.html";
      } catch (erro) {
        alert(erro.message);
      } finally {
        botao.disabled = false;
      }
    });
  } catch (erro) {
    alert("Não foi possível preparar o formulário: " + erro.message);
  }
})();
>>>>>>> f3023f5377c6b05559cd679ab40c95c33d6576cc
