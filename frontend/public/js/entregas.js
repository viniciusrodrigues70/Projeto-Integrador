
(function () {
    const API_PATH = "/entregas";
    const tbody = document.querySelector(".table-container tbody");

    if (!tbody) {
        return;
    }

    const busca = document.querySelector('.toolbar input[type="search"]');
    const periodo = document.querySelector(".toolbar select");
    const numeros = document.querySelectorAll(".stats .card .stat-number");
    const panel = tbody.closest(".panel");

    let entregas = [];

    for (const linha of tbody.rows) {
        entregas.push({
            id_entrega: linha.cells[0]?.textContent.trim(),
            familia: linha.cells[1]?.textContent.trim(),
            data_entrega: linha.cells[2]?.textContent.trim(),
            produto: linha.cells[3]?.textContent.trim(),
            quantidade: linha.cells[4]?.textContent.trim(),
            observacao: linha.cells[5]?.textContent.trim(),
            situacao: linha.cells[6]?.textContent.trim()
        });
    }

    function normalizar(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function dataPartes(valor) {
        const texto = String(valor || "").slice(0, 10);

        let resultado = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (resultado) {
            return {
                ano: Number(resultado[1]),
                mes: Number(resultado[2])
            };
        }

        resultado = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

        if (resultado) {
            return {
                ano: Number(resultado[3]),
                mes: Number(resultado[2])
            };
        }

        return null;
    }

    function periodoSelecionado() {
        const texto = normalizar(periodo?.selectedOptions[0]?.textContent);

        if (!texto || texto.includes("todos")) {
            return null;
        }

        const resultado = texto.match(/^([a-z]+)\/(\d{4})$/);

        if (!resultado) {
            return null;
        }

        const meses = [
            "janeiro", "fevereiro", "marco", "abril",
            "maio", "junho", "julho", "agosto",
            "setembro", "outubro", "novembro", "dezembro"
        ];

        return {
            mes: meses.indexOf(resultado[1]) + 1,
            ano: Number(resultado[2])
        };
    }

    function exibirAviso(texto) {
        let aviso = document.getElementById("entregas-aviso");

        if (!aviso) {
            aviso = document.createElement("div");
            aviso.id = "entregas-aviso";
            aviso.className = "notice";

            panel.insertBefore(
                aviso,
                panel.querySelector(".table-container")
            );
        }

        aviso.textContent = texto;
        aviso.hidden = !texto;
    }

    function desenhar() {
        const termo = normalizar(busca?.value);
        const filtroPeriodo = periodoSelecionado();
        const filtradas = [];

        for (const entrega of entregas) {
            const familia = normalizar(entrega.familia);
            const produto = normalizar(entrega.produto);
            const observacao = normalizar(entrega.observacao);

            const correspondeTexto =
                familia.includes(termo) ||
                produto.includes(termo) ||
                observacao.includes(termo);

            const data = dataPartes(entrega.data_entrega);

            const correspondePeriodo =
                !filtroPeriodo ||
                (
                    data &&
                    data.mes === filtroPeriodo.mes &&
                    data.ano === filtroPeriodo.ano
                );

            if (correspondeTexto && correspondePeriodo) {
                filtradas.push(entrega);
            }
        }

        tbody.replaceChildren();

        if (filtradas.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");

            td.colSpan = 7;
            td.className = "empty-state";
            td.textContent = "Nenhuma entrega corresponde aos filtros.";

            tr.appendChild(td);
            tbody.appendChild(tr);

        } else {
            for (let i = 0; i < filtradas.length; i++) {
                const entrega = filtradas[i];
                const tr = document.createElement("tr");

                const valores = [
                    entrega.id_entrega ?? i + 1,
                    entrega.familia,
                    entrega.data_entrega,
                    entrega.produto,
                    entrega.quantidade,
                    entrega.observacao,
                    entrega.situacao || "Concluída"
                ];

                for (let coluna = 0; coluna < valores.length; coluna++) {
                    const td = document.createElement("td");
                    const valor = valores[coluna];

                    if (coluna === 6) {
                        const status = document.createElement("span");

                        status.className = "status";
                        status.textContent = String(valor || "Concluída");

                        td.appendChild(status);
                    } else {
                        td.textContent = String(valor ?? "—");
                    }

                    tr.appendChild(td);
                }

                tbody.appendChild(tr);
            }
        }

        if (numeros[0]) {
            numeros[0].textContent = String(filtradas.length);
        }

        const familias = [];

        for (const entrega of filtradas) {
            if (entrega.familia && !familias.includes(entrega.familia)) {
                familias.push(entrega.familia);
            }
        }

        if (numeros[1]) {
            numeros[1].textContent = String(familias.length);
        }
    }

    async function carregar() {
        try {
            const resposta = await BancoAuth.api(API_PATH);
            let lista = resposta;

            if (!Array.isArray(resposta)) {
                lista = resposta.entregas;
            }

            if (!Array.isArray(lista)) {
                throw new Error("A API retornou uma lista inválida.");
            }

            entregas = [];

            for (const entrega of lista) {
                entregas.push({
                    id_entrega: entrega.id_entrega ?? entrega.id,
                    familia: entrega.familia ?? entrega.nome_responsavel ?? entrega.nome_familia ?? "Família",
                    data_entrega: entrega.data_entrega ?? entrega.data,
                    produto: entrega.produto ?? entrega.produtos ?? "—",
                    quantidade: entrega.quantidade ?? "—",
                    observacao: entrega.observacao ?? "—",
                    situacao: entrega.situacao ?? "Concluída"
                });
            }

            exibirAviso("");
            desenhar();

        } catch (error) {
            exibirAviso(
                "A API de entregas ainda não respondeu. Busca e filtro continuam disponíveis para os registros exibidos."
            );
        }
    }

    function abrirCadastro() {
        const dialog = document.createElement("dialog");

        dialog.style.cssText = "width:min(520px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";

        dialog.innerHTML = `
            <form method="dialog" class="panel-header">
                <div>
                    <h2>Registrar entrega</h2>
                    <p>Informe a família e os detalhes da entrega.</p>
                </div>
                <button class="btn btn-secondary" aria-label="Fechar">
                    Fechar
                </button>
            </form>

            <form id="nova-entrega" class="form-grid">
                <div class="form-group">
                    <label for="entrega-familia">ID da família</label>
                    <input id="entrega-familia" name="id_familia" type="number" min="1" required>
                </div>

                <div class="form-group">
                    <label for="entrega-data">Data</label>
                    <input id="entrega-data" name="data_entrega" type="date" required>
                </div>

                <div class="form-group full">
                    <label for="entrega-observacao">Observação</label>
                    <textarea id="entrega-observacao" name="observacao" maxlength="255" placeholder="Detalhes opcionais"></textarea>
                </div>

                <div class="form-group full" id="entrega-form-aviso" role="status" aria-live="polite"></div>

                <div class="form-group full form-actions">
                    <button type="button" class="btn btn-secondary" data-cancelar>
                        Cancelar
                    </button>
                    <button class="btn" type="submit">
                        Salvar entrega
                    </button>
                </div>
            </form>
        `;

        document.body.appendChild(dialog);

        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        dialog.querySelector("#entrega-data").value =
            `${ano}-${mes}-${dia}`;

        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) {
                dialog.close();
            }
        });

        const botaoCancelar = dialog.querySelector("[data-cancelar]");

        botaoCancelar.addEventListener("click", function () {
            dialog.close();
        });

        const form = dialog.querySelector("#nova-entrega");

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const botao = form.querySelector('[type="submit"]');
            const aviso = dialog.querySelector("#entrega-form-aviso");

            botao.disabled = true;

            try {
                const dados = {
                    id_familia: Number(form.elements.id_familia.value),
                    data_entrega: form.elements.data_entrega.value,
                    observacao: form.elements.observacao.value.trim()
                };

                await BancoAuth.api(API_PATH, {
                    method: "POST",
                    body: JSON.stringify(dados)
                });

                dialog.close();
                await carregar();

            } catch (error) {
                aviso.className = "auth-message error";
                aviso.textContent = error.message || "Não foi possível registrar a entrega.";

            } finally {
                botao.disabled = false;
            }
        });

        dialog.addEventListener("close", function () {
            dialog.remove();
        }, { once: true });

        dialog.showModal();
    }

    if (busca) {
        busca.addEventListener("input", desenhar);
    }

    if (periodo) {
        periodo.addEventListener("change", desenhar);
    }

    const linkCadastro = document.querySelector(
        'a[href*="cadastro-entregas"]'
    );

    if (linkCadastro) {
        linkCadastro.addEventListener("click", function (event) {
            event.preventDefault();
            abrirCadastro();
        });
    }

    desenhar();
    carregar();
})();
