
(function () {
    const aviso = document.getElementById("relatorios-aviso");

    const config = [
        [
            "/relatorios/vencimentos",
            "relatorio-vencimentos",
            ["id_lote", "produto", "doador", "quantidade", "validade", "dias_restantes"]
        ],
        [
            "/relatorios/doadores",
            "relatorio-doadores",
            ["doador", "lotes", "quantidade_recebida"]
        ],
        [
            "/relatorios/doacoes-mes",
            "relatorio-doacoes-mes",
            ["mes", "lotes", "quantidade_recebida"]
        ],
        [
            "/relatorios/familias-mes",
            "relatorio-familias-mes",
            ["mes", "familias_atendidas", "entregas"]
        ]
    ];

    async function carregar(relatorio) {
        const rota = relatorio[0];
        const id = relatorio[1];
        const colunas = relatorio[2];

        const corpo = document.getElementById(id);
        const paginar = BancoAuth.criarPaginador(corpo, colunas.length);

        const linhas = await BancoAuth.api(rota);

        paginar(linhas, function (item) {
            const linha = document.createElement("tr");

            for (const coluna of colunas) {
                const celula = document.createElement("td");

                celula.textContent = String(item[coluna] ?? "—");

                linha.appendChild(celula);
            }

            corpo.appendChild(linha);
        }, "Nenhum registro para o período.");
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
