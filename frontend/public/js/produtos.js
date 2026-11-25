(function () {
    const tbody = document.querySelector(".table-container tbody");
    const busca = document.querySelector('.toolbar input[type="search"]');
    const aviso = document.createElement("div");
    const painel = tbody?.closest(".panel");
    const tabela = tbody?.closest(".table-container");
    const linkNovo = document.querySelector('.toolbar a[href*="cadastro-produtos"]');
    let produtos = [];

    if (!tbody) {
        return;
    }

    aviso.className = "notice";
    painel?.insertBefore(aviso, tabela);
    tbody.replaceChildren();

    function normalizar(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function desenhar() {
        const termo = normalizar(busca?.value);
        const filtrados = produtos.filter(function (produto) {
            return normalizar([
                produto.nome,
                produto.descricao,
                produto.categoria
            ].join(" ")).includes(termo);
        });

        tbody.replaceChildren();

        if (filtrados.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");
            celula.colSpan = 7;
            celula.className = "empty-state";
            celula.textContent = produtos.length
                ? "Nenhum produto corresponde à busca."
                : "Nenhum produto cadastrado.";
            linha.appendChild(celula);
            tbody.appendChild(linha);
            return;
        }

        for (const produto of filtrados) {
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

            const acoes = document.createElement("td");
            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "btn btn-secondary";
            editar.textContent = "Editar";
            editar.addEventListener("click", function () {
                abrirFormulario(produto);
            });

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "btn btn-secondary";
            remover.textContent = "Remover";
            remover.addEventListener("click", function () {
                removerProduto(produto);
            });

            acoes.append(editar, remover);
            linha.appendChild(acoes);
            tbody.appendChild(linha);
        }
    }

    async function carregar() {
        try {
            produtos = await BancoAuth.api("/produtos");
            aviso.hidden = true;
            desenhar();
        } catch (error) {
            aviso.textContent = `Não foi possível carregar os produtos: ${error.message}`;
            aviso.hidden = false;
        }
    }

    function abrirFormulario(produto = null) {
        const dialog = document.createElement("dialog");
        dialog.style.cssText = "width:min(620px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";
        dialog.innerHTML = `
            <h2>${produto ? "Editar produto" : "Novo produto"}</h2>
            <form id="produto-form" class="form-grid">
                <div class="form-group"><label>Nome</label><input name="nome" maxlength="100" required></div>
                <div class="form-group"><label>Categoria</label><select name="categoria" required><option value="">Selecione</option><option>Grãos</option><option>Massas</option><option>Laticínios</option><option>Óleos</option><option>Enlatados</option><option>Outros</option></select></div>
                <div class="form-group full"><label>Descrição</label><input name="descricao" maxlength="300" required></div>
                <div class="form-group"><label>Peso</label><input name="peso" type="number" min="0" step="0.01"></div>
                <div class="form-group"><label>Quantidade em estoque</label><input name="quantidade" type="number" readonly></div>
                <div class="form-group full"><label><input name="confirmacao" type="checkbox" required> Confirmo que os dados do produto estão corretos.</label></div>
                <div class="form-group full" data-aviso role="status" aria-live="polite"></div>
                <div class="form-group full form-actions"><button type="button" class="btn btn-secondary" data-cancelar>Cancelar</button><button type="submit" class="btn">Salvar</button></div>
            </form>
        `;

        document.body.appendChild(dialog);
        const form = dialog.querySelector("#produto-form");

        if (produto) {
            form.elements.nome.value = produto.nome;
            form.elements.descricao.value = produto.descricao;
            const categorias = form.elements.categoria;
            const categoriaExiste = Array.from(categorias.options).some(function (opcao) {
                return opcao.value === produto.categoria;
            });
            if (!categoriaExiste) {
                categorias.add(new Option(produto.categoria, produto.categoria));
            }
            form.elements.categoria.value = produto.categoria;
            form.elements.peso.value = produto.peso ?? "";
            form.elements.quantidade.value = produto.quantidade ?? 0;
        } else {
            form.elements.quantidade.value = 0;
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
                nome: form.elements.nome.value.trim(),
                descricao: form.elements.descricao.value.trim(),
                categoria: form.elements.categoria.value,
                peso: form.elements.peso.value ? Number(form.elements.peso.value) : null,
                quantidade: produto ? Number(produto.quantidade) : 0
            };

            try {
                await BancoAuth.api(produto ? `/produtos/${produto.id_produto}` : "/produtos", {
                    method: produto ? "PUT" : "POST",
                    body: JSON.stringify(dados)
                });
                dialog.close();
                await carregar();
            } catch (error) {
                const mensagem = dialog.querySelector("[data-aviso]");
                mensagem.className = "auth-message error";
                mensagem.textContent = error.message;
            } finally {
                botao.disabled = false;
            }
        });

        dialog.addEventListener("close", function () { dialog.remove(); }, { once: true });
        dialog.showModal();
    }

    async function removerProduto(produto) {
        if (!window.confirm(`Remover o produto ${produto.nome}?`)) return;

        try {
            await BancoAuth.api(`/produtos/${produto.id_produto}`, { method: "DELETE" });
            await carregar();
        } catch (error) {
            aviso.textContent = error.message;
            aviso.hidden = false;
        }
    }

    busca?.addEventListener("input", desenhar);
    linkNovo?.addEventListener("click", function (event) {
        event.preventDefault();
        abrirFormulario();
    });

    carregar();
})();
