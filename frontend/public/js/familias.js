(function () {
    const tbody = document.querySelector(".table-container tbody");
    const busca = document.querySelector('.toolbar input[type="search"]');
    const paginar = BancoAuth.criarPaginador(tbody, 7);

    if (!tbody) {
        return;
    }

    tbody.replaceChildren();

    const aviso = document.createElement("div");

    aviso.className = "notice";

    const painel = tbody.closest(".panel");
    const tabela = tbody.closest(".table-container");

    function normalizar(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function filtrar() {
        const termo = normalizar(busca?.value);
        for (const linha of tbody.rows) {
            const corresponde = normalizar(linha.textContent).includes(termo);
            linha.dataset.filtrado = corresponde ? "sim" : "nao";
            linha.hidden = !corresponde;
        }
    }

    painel?.insertBefore(aviso, tabela);

    async function carregar() {
        try {
            const familias = await BancoAuth.api("/familias");

            tbody.replaceChildren();

            for (const familia of familias) {
                const linha = document.createElement("tr");

                const valores = [
                    familia.id_familia,
                    familia.nome_responsavel,
                    familia.cpf_responsavel,
                    familia.num_integrantes,
                    familia.telefone ?? "—",
                    familia.endereco
                ];

                for (const valor of valores) {
                    const celula = document.createElement("td");

                    celula.textContent = String(valor ?? "—");

                    linha.appendChild(celula);
                }

                const colunaAcao = document.createElement("td");
                const botao = document.createElement("button");

                botao.type = "button";
                botao.className = "btn btn-secondary";
                botao.textContent = "Ver histórico";

                botao.addEventListener("click", function () {
                    mostrarHistorico(familia);
                });

                const editar = document.createElement("button");
                editar.type = "button";
                editar.className = "btn btn-secondary";
                editar.textContent = "Editar";
                editar.addEventListener("click", function () {
                    abrirFormulario(familia);
                });

                const remover = document.createElement("button");
                remover.type = "button";
                remover.className = "btn btn-secondary";
                remover.textContent = "Remover";
                remover.addEventListener("click", function () {
                    removerFamilia(familia);
                });

                colunaAcao.append(botao, editar, remover);
                linha.appendChild(colunaAcao);

                tbody.appendChild(linha);
            }

            aviso.hidden = true;

            if (familias.length === 0) {
                const linha = document.createElement("tr");

                linha.innerHTML = `
                    <td colspan="7" class="empty-state">
                        Nenhuma família cadastrada.
                    </td>
                `;

                tbody.appendChild(linha);
            }

            filtrar();
            paginar.aplicar();

        } catch (error) {
            aviso.textContent = `Não foi possível carregar as famílias: ${error.message}`;
            aviso.hidden = false;
        }
    }

    busca?.addEventListener("input", function () {
        filtrar();
        paginar.reiniciar();
    });

    const linkCadastro = document.querySelector('.toolbar a[href*="cadastro-familias"]');
    linkCadastro?.addEventListener("click", function (event) {
        event.preventDefault();
        abrirFormulario();
    });

    function abrirFormulario(familia = null) {
        const dialog = document.createElement("dialog");
        dialog.style.cssText = "width:min(680px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";
        dialog.innerHTML = `
            <h2>${familia ? "Editar família" : "Nova família"}</h2>
            <form id="familia-form" class="form-grid">
                <div class="form-group"><label>Responsável</label><input name="nome_responsavel" required maxlength="200"></div>
                <div class="form-group"><label>CPF</label><input name="cpf_responsavel" required maxlength="14" pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" placeholder="000.000.000-00"></div>
                <div class="form-group"><label>Integrantes</label><select name="num_integrantes" required><option value="">Selecione</option><option value="1">1 integrante</option><option value="2">2 integrantes</option><option value="3">3 integrantes</option><option value="4">4 integrantes</option><option value="5">5 integrantes</option><option value="6">6 integrantes</option><option value="7">7 integrantes</option><option value="8">8 integrantes</option><option value="9">9 integrantes</option><option value="10">10 integrantes</option><option value="mais">Mais de 10</option></select><input name="integrantes_exato" type="number" min="11" placeholder="Informe a quantidade exata" hidden></div>
                <div class="form-group"><label>Telefone</label><input name="telefone" type="tel" maxlength="20"></div>
                <div class="form-group full"><label>Endereço</label><input name="endereco" required maxlength="260"></div>
                <div class="form-group full"><label><input name="confirmacao" type="checkbox" required> Confirmo que os dados da família foram conferidos.</label></div>
                <div class="form-group full" data-aviso role="status" aria-live="polite"></div>
                <div class="form-group full form-actions"><button type="button" class="btn btn-secondary" data-cancelar>Cancelar</button><button type="submit" class="btn">Salvar</button></div>
            </form>
        `;

        document.body.appendChild(dialog);
        const form = dialog.querySelector("#familia-form");
        const integrantes = form.elements.num_integrantes;
        const integrantesExato = form.elements.integrantes_exato;

        integrantes.addEventListener("change", function () {
            const precisaInformarQuantidade = integrantes.value === "mais";
            integrantesExato.hidden = !precisaInformarQuantidade;
            integrantesExato.required = precisaInformarQuantidade;
            if (!precisaInformarQuantidade) integrantesExato.value = "";
        });

        if (familia) {
            form.elements.nome_responsavel.value = familia.nome_responsavel;
            form.elements.cpf_responsavel.value = familia.cpf_responsavel;
            if (Number(familia.num_integrantes) <= 10) {
                integrantes.value = String(familia.num_integrantes);
            } else {
                integrantes.value = "mais";
                integrantesExato.hidden = false;
                integrantesExato.required = true;
                integrantesExato.value = familia.num_integrantes;
            }
            form.elements.telefone.value = familia.telefone || "";
            form.elements.endereco.value = familia.endereco;
        }

        dialog.querySelector("[data-cancelar]").addEventListener("click", function () {
            dialog.close();
        });

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const botao = form.querySelector('[type="submit"]');
            botao.disabled = true;
            const dados = {
                nome_responsavel: form.elements.nome_responsavel.value.trim(),
                cpf_responsavel: form.elements.cpf_responsavel.value.trim(),
                num_integrantes: integrantes.value === "mais"
                    ? Number(integrantesExato.value)
                    : Number(integrantes.value),
                telefone: form.elements.telefone.value.trim() || null,
                endereco: form.elements.endereco.value.trim()
            };

            try {
                await BancoAuth.api(familia ? `/familias/${familia.id_familia}` : "/familias", {
                    method: familia ? "PUT" : "POST",
                    body: JSON.stringify(dados)
                });
                dialog.close();
                await carregar();
            } catch (error) {
                const avisoFormulario = dialog.querySelector("[data-aviso]");
                avisoFormulario.className = "auth-message error";
                avisoFormulario.textContent = error.message;
            } finally {
                botao.disabled = false;
            }
        });

        dialog.addEventListener("close", function () { dialog.remove(); }, { once: true });
        dialog.showModal();
    }

    async function removerFamilia(familia) {
        if (!window.confirm(`Remover a família de ${familia.nome_responsavel}?`)) return;

        try {
            await BancoAuth.api(`/familias/${familia.id_familia}`, { method: "DELETE" });
            await carregar();
        } catch (error) {
            aviso.textContent = error.message;
            aviso.hidden = false;
        }
    }

    async function mostrarHistorico(familia) {
        const dialog = document.createElement("dialog");

        dialog.style.cssText = "width:min(760px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";

        const cabecalho = document.createElement("div");
        cabecalho.className = "panel-header";

        const titulo = document.createElement("h2");
        titulo.textContent = `Entregas de ${familia.nome_responsavel}`;

        const fechar = document.createElement("button");

        fechar.className = "btn btn-secondary";
        fechar.type = "button";
        fechar.textContent = "Fechar";

        fechar.addEventListener("click", function () {
            dialog.close();
        });

        cabecalho.append(titulo, fechar);

        const mensagem = document.createElement("p");
        mensagem.textContent = "Carregando histórico…";

        dialog.append(cabecalho, mensagem);

        document.body.appendChild(dialog);

        dialog.addEventListener("close", function () {
            dialog.remove();
        }, { once: true });

        dialog.showModal();

        try {
            const entregas = await BancoAuth.api(
                `/entregas/familia/${familia.id_familia}`
            );

            if (entregas.length > 0) {
                const historico = [];

                for (const entrega of entregas) {
                    let texto = BancoAuth.formatarData(entrega.data_entrega);

                    texto += " — ";
                    texto += entrega.itens || "Itens não detalhados";

                    if (entrega.observacao) {
                        texto += ` — ${entrega.observacao}`;
                    }

                    historico.push(texto);
                }

                mensagem.textContent = historico.join("\n");

            } else {
                mensagem.textContent = "Nenhuma entrega registrada para esta família.";
            }

            mensagem.style.whiteSpace = "pre-line";

        } catch (error) {
            mensagem.textContent = `Não foi possível carregar o histórico: ${error.message}`;
        }
    }

    carregar();
})();
