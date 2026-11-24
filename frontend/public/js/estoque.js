(function () {
    const form = document.getElementById("formEstoque");

    function criarStatus(alvo) {
        const status = document.createElement("div");

        status.className = "auth-message";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");

        alvo.insertAdjacentElement("beforebegin", status);

        return status;
    }

    if (form) {
        const doador = document.getElementById("doador");
        const itensContainer = document.getElementById("itens-doacao");
        const botaoAdicionar = document.getElementById("adicionar-item-doacao");
        const recebimento = document.getElementById("recebimento");
        const status = criarStatus(form);

        let produtos = [];

        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        recebimento.value = `${ano}-${mes}-${dia}`;

        function adicionarLinha() {
            const linha = document.createElement("div");

            linha.className = "form-grid item-doacao";

            linha.innerHTML = `
                <div class="form-group">
                    <label>Produto</label>
                    <select class="produto-doacao" required>
                        <option value="">Selecione o produto</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Quantidade</label>
                    <input class="quantidade-doacao" type="number" min="1" step="1" required>
                </div>

                <div class="form-group">
                    <label>Validade</label>
                    <input class="validade-doacao" type="date" required>
                </div>

                <div class="form-group form-actions">
                    <button type="button" class="btn btn-secondary remover-item-doacao">
                        Remover
                    </button>
                </div>
            `;

            const select = linha.querySelector(".produto-doacao");

            for (const produto of produtos) {
                select.add(
                    new Option(produto.nome, produto.id_produto)
                );
            }

            const botaoRemover = linha.querySelector(".remover-item-doacao");

            botaoRemover.addEventListener("click", function () {
                if (itensContainer.children.length > 1) {
                    linha.remove();
                }
            });

            itensContainer.appendChild(linha);
        }

        botaoAdicionar.addEventListener("click", adicionarLinha);

        adicionarLinha();

        async function carregarOpcoes() {
            try {
                const resultados = await Promise.all([
                    BancoAuth.api("/doadores"),
                    BancoAuth.api("/produtos")
                ]);

                const doadores = resultados[0];
                produtos = resultados[1];

                doador.replaceChildren(
                    new Option("Selecione o doador", "")
                );

                for (const registro of doadores) {
                    doador.add(
                        new Option(registro.nome, registro.id_doador)
                    );
                }

                const selects = itensContainer.querySelectorAll(".produto-doacao");

                for (const select of selects) {
                    for (const produto of produtos) {
                        select.add(
                            new Option(produto.nome, produto.id_produto)
                        );
                    }
                }

            } catch (error) {
                BancoAuth.mensagem(
                    status,
                    `Não foi possível carregar doadores e produtos. ${error.message}`,
                    true
                );
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

            const linhas = itensContainer.querySelectorAll(".item-doacao");
            const itens = [];

            for (const linha of linhas) {
                itens.push({
                    id_produto: Number(linha.querySelector(".produto-doacao").value),
                    quantidade: Number(linha.querySelector(".quantidade-doacao").value),
                    validade: linha.querySelector(".validade-doacao").value
                });
            }

            try {
                const dados = {
                    id_doador: Number(doador.value),
                    data_recebimento: recebimento.value,
                    itens: itens
                };

                const resposta = await BancoAuth.api("/lotes", {
                    method: "POST",
                    body: JSON.stringify(dados)
                });

                BancoAuth.mensagem(
                    status,
                    resposta.mensagem || "Doação registrada."
                );

                window.setTimeout(function () {
                    window.location.href = "estoque.html";
                }, 700);

            } catch (error) {
                BancoAuth.mensagem(
                    status,
                    error.message || "Não foi possível registrar a doação.",
                    true
                );

            } finally {
                botao.disabled = false;
            }
        });

        carregarOpcoes();
    }

    const tabelas = document.querySelectorAll(".table-container table");

    if (tabelas.length >= 2) {
        const corpoProdutos = tabelas[0].querySelector("tbody");
        const corpoLotes = tabelas[1].querySelector("tbody");
        const buscas = document.querySelectorAll('.toolbar input[type="search"]');
        const filtroSituacao = document.querySelector(".toolbar select");

        function normalizar(valor) {
            return String(valor || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
        }

        function filtrarTabela(corpo, termo, situacao = "") {
            for (const linha of corpo.rows) {
                const correspondeTexto = normalizar(linha.textContent).includes(normalizar(termo));
                const correspondeSituacao = !situacao || normalizar(situacao) === "todas as situacoes" ||
                    normalizar(linha.cells[linha.cells.length - 1]?.textContent).includes(normalizar(situacao));
                linha.hidden = !(correspondeTexto && correspondeSituacao);
            }
        }

        buscas[0]?.addEventListener("input", function () {
            filtrarTabela(corpoProdutos, buscas[0].value);
        });
        buscas[1]?.addEventListener("input", function () {
            filtrarTabela(corpoLotes, buscas[1].value, filtroSituacao?.value);
        });
        filtroSituacao?.addEventListener("change", function () {
            filtrarTabela(corpoLotes, buscas[1]?.value, filtroSituacao.value);
        });

        corpoProdutos.replaceChildren();
        corpoLotes.replaceChildren();

        async function carregarEstoque() {
            try {
                const estoque = await BancoAuth.api("/estoque");
                const produtos = estoque.produtos;
                const lotes = estoque.lotes;

                corpoProdutos.replaceChildren();

                for (const produto of produtos) {
                    const linha = document.createElement("tr");
                    const valores = [
                        produto.nome,
                        produto.categoria,
                        produto.quantidade,
                        "Unidades",
                        Number(produto.quantidade) > 0 ? "Disponível" : "Sem estoque"
                    ];

                    for (let i = 0; i < valores.length; i++) {
                        const celula = document.createElement("td");
                        const valor = valores[i];

                        if (i === valores.length - 1) {
                            const status = document.createElement("span");
                            status.className = Number(produto.quantidade) > 0 ? "status" : "status danger";
                            status.textContent = valor;
                            celula.appendChild(status);
                        } else {
                            celula.textContent = String(valor ?? "—");
                        }
                        linha.appendChild(celula);
                    }

                    corpoProdutos.appendChild(linha);
                }

                corpoLotes.replaceChildren();

                const hoje = new Date();

                const ano = hoje.getFullYear();
                const mes = String(hoje.getMonth() + 1).padStart(2, "0");
                const dia = String(hoje.getDate()).padStart(2, "0");

                const hojeISO = `${ano}-${mes}-${dia}`;

                for (const lote of lotes) {
                    const linha = document.createElement("tr");
                    const expirado = lote.validade < hojeISO;
                    const diasRestantes = Math.ceil((new Date(`${lote.validade}T00:00:00`) - new Date(`${hojeISO}T00:00:00`)) / 86400000);

                    let situacao;

                    if (expirado) {
                        situacao = "Vencido";
                    } else if (Number(lote.qtd_atual) > 0 && diasRestantes <= 30) {
                        situacao = "Próximo do vencimento";
                    } else if (lote.qtd_atual > 0) {
                        situacao = "Disponível";
                    } else {
                        situacao = "Esgotado";
                    }

                    const valores = [
                        lote.id_lote,
                        lote.produto,
                        lote.doador,
                        lote.qtd_inicial,
                        lote.qtd_atual,
                        lote.data_recebimento,
                        lote.validade,
                        situacao
                    ];

                    for (let i = 0; i < valores.length; i++) {
                        const celula = document.createElement("td");
                        const valor = valores[i];

                        if (i === valores.length - 1) {
                            const etiqueta = document.createElement("span");

                            etiqueta.className = expirado
                                ? "status danger"
                                : situacao === "Próximo do vencimento" ? "status warning" : "status";
                            etiqueta.textContent = String(valor);

                            celula.appendChild(etiqueta);
                        } else {
                            celula.textContent = String(valor ?? "—");
                        }

                        linha.appendChild(celula);
                    }

                    corpoLotes.appendChild(linha);
                }

                filtrarTabela(corpoProdutos, buscas[0]?.value);
                filtrarTabela(corpoLotes, buscas[1]?.value, filtroSituacao?.value);

            } catch (error) {
                const status = criarStatus(tabelas[0]);

                BancoAuth.mensagem(
                    status,
                    `Não foi possível carregar o estoque. ${error.message}`,
                    true
                );

                const corpos = [corpoProdutos, corpoLotes];

                for (const corpo of corpos) {
                    const linha = document.createElement("tr");
                    const celula = document.createElement("td");

                    if (corpo === corpoProdutos) {
                        celula.colSpan = 5;
                    } else {
                        celula.colSpan = 8;
                    }

                    celula.className = "empty-state";
                    celula.textContent = "Estoque indisponível.";

                    linha.appendChild(celula);
                    corpo.appendChild(linha);
                }
            }
        }

        carregarEstoque();
    }
})();
