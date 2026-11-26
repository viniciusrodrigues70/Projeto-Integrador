(function () {
    const API_PATH = "/doadores";
    const tbody = document.querySelector(".table-container tbody");

    if (!tbody) {
        return;
    }

    const busca = document.querySelector('.toolbar input[type="search"]');
    const total = document.querySelector(".stats .card .stat-number");
    const panel = tbody.closest(".panel");
    const paginar = BancoAuth.criarPaginador(tbody, 6);

    let doadores = [];

    for (const linha of tbody.rows) {
        doadores.push({
            id_doador: linha.cells[0]?.textContent.trim(),
            nome: linha.cells[1]?.textContent.trim(),
            email: linha.cells[2]?.textContent.trim(),
            telefone: linha.cells[3]?.textContent.trim()
        });
    }

    function normalizar(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function exibirAviso(texto, erro = false) {
        let aviso = document.getElementById("doadores-aviso");

        if (!aviso) {
            aviso = document.createElement("div");
            aviso.id = "doadores-aviso";
            aviso.className = "notice";

            panel.insertBefore(
                aviso,
                panel.querySelector(".table-container")
            );
        }

        aviso.textContent = texto;
        aviso.hidden = !texto;
        aviso.classList.toggle("error", erro);
    }

    function desenhar() {
        const termo = normalizar(busca?.value);
        const filtrados = [];

        for (const doador of doadores) {
            const nome = normalizar(doador.nome);
            const email = normalizar(doador.email);
            const telefone = normalizar(doador.telefone);

            if (
                nome.includes(termo) ||
                email.includes(termo) ||
                telefone.includes(termo)
            ) {
                filtrados.push(doador);
            }
        }

        paginar(filtrados, function (doador, i) {
                const tr = document.createElement("tr");

                const valores = [
                    doador.id_doador ?? i + 1,
                    doador.nome,
                    doador.email,
                    doador.telefone || "—",
                    "Cadastrado"
                ];

                for (let coluna = 0; coluna < valores.length; coluna++) {
                    const td = document.createElement("td");
                    const valor = valores[coluna];

                    if (coluna === 4) {
                        const status = document.createElement("span");

                        status.className = "status";
                        status.textContent = String(valor);

                        td.appendChild(status);
                    } else {
                        td.textContent = String(valor ?? "—");
                    }

                    tr.appendChild(td);
                }

                const acoes = document.createElement("td");
                const editar = document.createElement("button");
                editar.type = "button";
                editar.className = "btn btn-secondary";
                editar.textContent = "Editar";
                editar.addEventListener("click", function () {
                    abrirCadastro(doador);
                });

                const remover = document.createElement("button");
                remover.type = "button";
                remover.className = "btn btn-secondary";
                remover.textContent = "Remover";
                remover.addEventListener("click", function () {
                    removerDoador(doador);
                });

                acoes.append(editar, remover);
                tr.appendChild(acoes);
                tbody.appendChild(tr);
        }, "Nenhum doador corresponde à busca.");

        if (total) {
            total.textContent = String(doadores.length);
        }
    }

    async function carregar() {
        if (!window.BancoAuth?.api) {
            exibirAviso(
                "Não foi possível iniciar a integração com a API. Os registros exibidos são os que já estavam na página.",
                true
            );
            return;
        }

        try {
            const resposta = await BancoAuth.api(API_PATH);
            let lista = resposta;

            if (!Array.isArray(resposta)) {
                lista = resposta.doadores;
            }

            if (!Array.isArray(lista)) {
                throw new Error("A API retornou uma lista inválida.");
            }

            doadores = lista;

            exibirAviso("");
            desenhar();

        } catch (error) {
            exibirAviso(
                "Não foi possível carregar doadores do servidor. Confira a API; a busca ainda funciona sobre os registros já exibidos.",
                true
            );
        }
    }

    function abrirCadastro(doador = null) {
        const dialog = document.createElement("dialog");

        dialog.style.cssText = "width:min(520px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";

        dialog.innerHTML = `
            <form method="dialog" class="panel-header">
                <div>
                    <h2>Novo doador</h2>
                    <p>Preencha os dados do doador.</p>
                </div>
                <button class="btn btn-secondary" aria-label="Fechar">
                    Fechar
                </button>
            </form>

            <form id="novo-doador" class="form-grid">
                <div class="form-group full">
                    <label for="doador-nome">Nome</label>
                    <input id="doador-nome" name="nome" required maxlength="100">
                </div>

                <div class="form-group">
                    <label for="doador-email">E-mail</label>
                    <input id="doador-email" name="email" type="email" maxlength="100" required>
                </div>

                <div class="form-group">
                    <label for="doador-telefone">Telefone</label>
                    <input id="doador-telefone" name="telefone" maxlength="20">
                </div>

                <div class="form-group full">
                    <label for="doador-tipo">Tipo</label>
                    <select id="doador-tipo" name="tipo_doador" required>
                        <option value="">Selecione</option>
                        <option value="PESSOA_FISICA">Pessoa física</option>
                        <option value="EMPRESA/INSTITUICAO">Empresa / instituição</option>
                    </select>
                </div>

                <div class="form-group full">
                    <label>
                        <input type="checkbox" name="confirmacao" required>
                        Confirmo que os dados do doador foram conferidos.
                    </label>
                </div>

                <div class="form-group full" id="doador-form-aviso" role="status" aria-live="polite"></div>

                <div class="form-group full form-actions">
                    <button type="button" class="btn btn-secondary" data-cancelar>
                        Cancelar
                    </button>
                    <button class="btn" type="submit">
                        Salvar doador
                    </button>
                </div>
            </form>
        `;

        document.body.appendChild(dialog);

        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) {
                dialog.close();
            }
        });

        const botaoCancelar = dialog.querySelector("[data-cancelar]");

        botaoCancelar.addEventListener("click", function () {
            dialog.close();
        });

        const form = dialog.querySelector("#novo-doador");

        if (doador) {
            dialog.querySelector("h2").textContent = "Editar doador";
            form.elements.nome.value = doador.nome || "";
            form.elements.email.value = doador.email || "";
            form.elements.telefone.value = doador.telefone || "";
            form.elements.tipo_doador.value = doador.tipo_doador || "";
            form.querySelector('[type="submit"]').textContent = "Salvar alterações";
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const botao = form.querySelector('[type="submit"]');
            const aviso = dialog.querySelector("#doador-form-aviso");

            botao.disabled = true;

            try {
                const dados = {
                    nome: form.elements.nome.value.trim(),
                    email: form.elements.email.value.trim(),
                    telefone: form.elements.telefone.value.trim(),
                    tipo_doador: form.elements.tipo_doador.value
                };

                await BancoAuth.api(doador ? `${API_PATH}/${doador.id_doador}` : API_PATH, {
                    method: doador ? "PUT" : "POST",
                    body: JSON.stringify(dados)
                });

                dialog.close();
                await carregar();

            } catch (error) {
                aviso.className = "auth-message error";
                aviso.textContent = error.message || "Não foi possível salvar o doador.";

            } finally {
                botao.disabled = false;
            }
        });

        dialog.addEventListener("close", function () {
            dialog.remove();
        }, { once: true });

        dialog.showModal();
    }

    async function removerDoador(doador) {
        if (!window.confirm(`Remover o doador ${doador.nome}?`)) {
            return;
        }

        try {
            await BancoAuth.api(`${API_PATH}/${doador.id_doador}`, {
                method: "DELETE"
            });
            await carregar();
        } catch (error) {
            exibirAviso(error.message, true);
        }
    }

    if (busca) {
        busca.addEventListener("input", desenhar);
    }

    const linkCadastro = document.querySelector(
        '.toolbar a[href*="cadastro-doadores"]'
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
