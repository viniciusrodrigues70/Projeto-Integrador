
(function () {
    const aviso = document.getElementById("relatorios-aviso");

    const config = [
        [
            "/relatorios/lotes-vencendo?dias=30",
            "relatorio-vencimentos",
            ["id_lote", "produto", "doador", "quantidade", "validade", "dias_restantes"]
        ],
        [
            "/relatorios/doacoes-por-doador",
            "relatorio-doadores",
            ["doador", "lotes", "quantidade_recebida"]
        ],
        [
            "/relatorios/doacoes-por-mes",
            "relatorio-doacoes-mes",
            ["mes", "lotes", "quantidade_recebida"]
        ],
        [
            "/relatorios/familias-atendidas-por-mes",
            "relatorio-familias-mes",
            ["mes", "familias_atendidas", "entregas"]
        ]
    ];

    async function carregar(relatorio) {
        const rota = relatorio[0];
        const id = relatorio[1];
        const colunas = relatorio[2];

        const corpo = document.getElementById(id);

        const linhas = await BancoAuth.api(rota);

        corpo.replaceChildren();

        if (linhas.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = colunas.length;
            celula.className = "empty-state";
            celula.textContent = "Nenhum registro para o período.";

            linha.appendChild(celula);
            corpo.appendChild(linha);

            return;
        }

        for (const item of linhas) {
            const linha = document.createElement("tr");

            for (const coluna of colunas) {
                const celula = document.createElement("td");

                celula.textContent = String(item[coluna] ?? "—");

                linha.appendChild(celula);
            }

            corpo.appendChild(linha);
        }
    }

    async function carregarTodos() {
        try {
            const carregamentos = [];

            for (const relatorio of config) {
                carregamentos.push(carregar(relatorio));
            }

            await Promise.all(carregamentos);

        } catch (error) {
            aviso.textContent = `Não foi possível carregar os relatórios. ${error.message}`;
            aviso.hidden = false;
        }
    }

    carregarTodos();
})();
