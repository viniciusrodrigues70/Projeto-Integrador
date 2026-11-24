const pool = require("../config/database");

function erro(status, mensagem) {
    const novoErro = new Error(mensagem);
    novoErro.status = status;
    return novoErro;
}

function validarDataISO(valor) {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const data = new Date(valor + "T00:00:00Z");

    if (Number.isNaN(data.getTime())) {
        return false;
    }

    return data.toISOString().slice(0, 10) === valor;
}

class EstoqueService {

    async registrarDoacao({ id_doador, data_recebimento, itens }) {
        const doadorId = Number(id_doador);

        if (!Number.isInteger(doadorId) || doadorId < 1) {
            throw erro(400, "Selecione um doador válido.");
        }

        if (!validarDataISO(data_recebimento)) {
            throw erro(400, "Informe uma data de recebimento válida.");
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            throw erro(400, "Adicione pelo menos um produto à doação.");
        }

        const itensValidados = [];

        for (const item of itens) {
            const produtoId = Number(item.id_produto);
            const quantidade = Number(item.quantidade);

            if (
                !Number.isInteger(produtoId) || produtoId < 1 ||
                !Number.isInteger(quantidade) || quantidade < 1 ||
                !validarDataISO(item.validade) ||
                item.validade < data_recebimento
            ) {
                throw erro(
                    400,
                    "Cada item precisa de produto, quantidade inteira positiva e validade igual ou posterior ao recebimento."
                );
            }

            itensValidados.push({
                id_produto: produtoId,
                quantidade: quantidade,
                validade: item.validade
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [datasFuturas] = await connection.execute(
                "SELECT ? > CURDATE() AS futura",
                [data_recebimento]
            );

            if (Number(datasFuturas[0].futura) === 1) {
                throw erro(400, "A data de recebimento não pode estar no futuro.");
            }

            const [doadores] = await connection.execute(
                "SELECT id_doador FROM Doador WHERE id_doador = ? FOR UPDATE",
                [doadorId]
            );

            if (doadores.length === 0) {
                throw erro(404, "Doador não encontrado.");
            }

            for (const item of itensValidados) {
                const [produtos] = await connection.execute(
                    "SELECT id_produto FROM Produto WHERE id_produto = ? FOR UPDATE",
                    [item.id_produto]
                );

                if (produtos.length === 0) {
                    throw erro(404, `Produto ${item.id_produto} não encontrado.`);
                }
            }

            const lotes = [];

            for (const item of itensValidados) {
                const [resultado] = await connection.execute(
                    `INSERT INTO Lote (
                        validade, qtd_inicial, qtd_atual, data_recebimento,
                        id_produto, id_doador
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        item.validade,
                        item.quantidade,
                        item.quantidade,
                        data_recebimento,
                        item.id_produto,
                        doadorId
                    ]
                );

                lotes.push({
                    id_lote: resultado.insertId,
                    id_produto: item.id_produto,
                    id_doador: doadorId,
                    quantidade: item.quantidade,
                    validade: item.validade
                });
            }

            const produtosAtualizados = [];

            for (const item of itensValidados) {
                const produtoId = item.id_produto;

                if (!produtosAtualizados.includes(produtoId)) {
                    produtosAtualizados.push(produtoId);
                }
            }

            for (const produtoId of produtosAtualizados) {
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

            return lotes;

        } catch (error) {

            try {
                await connection.rollback();
            } catch (erroRollback) {
            }

            throw error;

        } finally {
            connection.release();
        }
    }
}

module.exports = new EstoqueService();
