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
                `/entregas/familia/${familia.id_familia}`
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
