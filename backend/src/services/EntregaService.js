const pool = require("../config/database");
const ItemEntregaDAO = require("../dao/ItemEntregaDAO");

function erro(status, mensagem) {
    const novoErro = new Error(mensagem);
    novoErro.status = status;
    return novoErro;
}

function dataValida(data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const dataUTC = new Date(data + "T00:00:00Z");

    if (Number.isNaN(dataUTC.getTime())) {
        return false;
    }

    return dataUTC.toISOString().slice(0, 10) === data;
}

function limiteMensalConfigurado() {
    const valor = Number(process.env.MAX_ENTREGAS_FAMILIA_MES || 1);

    if (Number.isInteger(valor) && valor >= 1) {
        return valor;
    }

    return 1;
}

class EntregaService {

    async registrar({
        id_familia,
        data_entrega,
        observacao = null,
        itens
    }) {
        const familiaId = Number(id_familia);

        if (!Number.isInteger(familiaId) || familiaId < 1) {
            throw erro(400, "Selecione uma família válida.");
        }

        if (!dataValida(data_entrega)) {
            throw erro(400, "Informe uma data de entrega válida.");
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            throw erro(400, "A cesta precisa conter pelo menos um produto.");
        }

        const quantidades = new Map();

        for (const item of itens) {
            const produtoId = Number(item.id_produto);
            const quantidade = Number(item.quantidade);

            if (
                !Number.isInteger(produtoId) || produtoId < 1 ||
                !Number.isInteger(quantidade) || quantidade < 1
            ) {
                throw erro(400, "Informe produto e quantidade inteira positiva para cada item.");
            }

            let quantidadeAtual = quantidades.get(produtoId) || 0;

            quantidades.set(produtoId, quantidadeAtual + quantidade);
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [familias] = await connection.execute(
                "SELECT id_familia FROM Familia WHERE id_familia = ? FOR UPDATE",
                [familiaId]
            );

            if (familias.length === 0) {
                throw erro(404, "Família não encontrada.");
            }

            const [datasFuturas] = await connection.execute(
                "SELECT ? > CURDATE() AS futura",
                [data_entrega]
            );

            if (Number(datasFuturas[0].futura) === 1) {
                throw erro(400, "A data de entrega não pode estar no futuro.");
            }

            const [entregasDoMes] = await connection.execute(
                `SELECT COUNT(*) AS total
                FROM Entrega_cesta
                WHERE id_familia = ?
                AND YEAR(data_entrega) = YEAR(?)
                AND MONTH(data_entrega) = MONTH(?)`,
                [familiaId, data_entrega, data_entrega]
            );

            if (Number(entregasDoMes[0].total) >= limiteMensalConfigurado()) {
                throw erro(409, "Esta família já atingiu o limite mensal de entregas.");
            }

            const [entrega] = await connection.execute(
                `INSERT INTO Entrega_cesta
                (data_entrega, observacao, id_familia)
                VALUES (?, ?, ?)`,
                [data_entrega, observacao, familiaId]
            );

            const produtosOrdenados = [];

            for (const [id, quantidade] of quantidades.entries()) {
                produtosOrdenados.push([id, quantidade]);
            }

            produtosOrdenados.sort(function(a, b) {
                return a[0] - b[0];
            });

            for (const [produtoId, quantidadeNecessaria] of produtosOrdenados) {

                const [produtos] = await connection.execute(
                    "SELECT id_produto FROM Produto WHERE id_produto = ? FOR UPDATE",
                    [produtoId]
                );

                if (produtos.length === 0) {
                    throw erro(404, `Produto ${produtoId} não encontrado.`);
                }

                const [lotes] = await connection.execute(
                    `SELECT id_lote, qtd_atual, validade
                    FROM Lote
                    WHERE id_produto = ?
                    AND qtd_atual > 0
                    AND validade >= CURDATE()
                    ORDER BY validade ASC, id_lote ASC
                    FOR UPDATE`,
                    [produtoId]
                );

                let disponivel = 0;

                for (const lote of lotes) {
                    disponivel += Number(lote.qtd_atual);
                }

                if (disponivel < quantidadeNecessaria) {
                    throw erro(
                        409,
                        `Estoque disponível insuficiente para o produto ${produtoId}.`
                    );
                }

                let restante = quantidadeNecessaria;

                for (const lote of lotes) {
                    if (restante === 0) {
                        break;
                    }

                    let quantidadeLote = Number(lote.qtd_atual);
                    let retirada = Math.min(restante, quantidadeLote);

                    await connection.execute(
                        "UPDATE Lote SET qtd_atual = qtd_atual - ? WHERE id_lote = ?",
                        [retirada, lote.id_lote]
                    );

                    restante = restante - retirada;
                }

                await ItemEntregaDAO.criar(
                    {
                        id_entrega: entrega.insertId,
                        id_produto: produtoId,
                        quantidade: quantidadeNecessaria
                    },
                    connection
                );

                await connection.execute(
                    `UPDATE Produto
                    SET quantidade = (
                        SELECT COALESCE(SUM(qtd_atual), 0)
                        FROM Lote
                        WHERE id_produto = ?
                    )
                    WHERE id_produto = ?`,
                    [produtoId, produtoId]
                );
            }

            await connection.commit();

            const itensRegistrados = [];

            for (const [id_produto, quantidade] of produtosOrdenados) {
                itensRegistrados.push({
                    id_produto: id_produto,
                    quantidade: quantidade
                });
            }

            return {
                id_entrega: entrega.insertId,
                id_familia: familiaId,
                data_entrega: data_entrega,
                itens: itensRegistrados
            };

        } catch (error) {

            try {
                await connection.rollback();
            } catch (erroRollback) {
                // Preserva o erro original.
            }

            throw error;

        } finally {
            connection.release();
        }
    }
}

module.exports = new EntregaService();
