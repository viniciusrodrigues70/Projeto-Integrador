(function () {
    const tbody = document.querySelector(".table-container tbody");
    const busca = document.querySelector('.toolbar input[type="search"]');

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
            linha.hidden = !normalizar(linha.textContent).includes(termo);
        }
    }

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

            filtrar();

        } catch (error) {
            aviso.textContent = `Não foi possível carregar os produtos: ${error.message}`;
            aviso.hidden = false;
        }
    }

    busca?.addEventListener("input", filtrar);

    carregar();
})();
