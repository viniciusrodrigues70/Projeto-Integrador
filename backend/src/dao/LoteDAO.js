const pool = require("../config/database");

const SELECT_LOTES = `
    SELECT
        l.id_lote,
        DATE_FORMAT(l.validade, '%Y-%m-%d') AS validade,
        l.qtd_inicial,
        l.qtd_atual,
        DATE_FORMAT(l.data_recebimento, '%Y-%m-%d') AS data_recebimento,
        l.id_produto,
        p.nome AS produto,
        l.id_doador,
        d.nome AS doador
    FROM Lote AS l
    INNER JOIN Produto AS p
        ON p.id_produto = l.id_produto
    INNER JOIN Doador AS d
        ON d.id_doador = l.id_doador
`;

class LoteDAO {
    async listarTodos() {
        const [lotes] = await pool.execute(
            `${SELECT_LOTES}
            ORDER BY l.validade ASC, l.id_lote ASC`
        );

        return lotes;
    }

    async buscarPorId(id) {
        const [lotes] = await pool.execute(
            `${SELECT_LOTES}
            WHERE l.id_lote = ?
            LIMIT 1`,
            [id]
        );

        return lotes[0] || null;
    }

    async listarPorProduto(idProduto) {
        const [lotes] = await pool.execute(
            `${SELECT_LOTES}
            WHERE l.id_produto = ?
            ORDER BY l.validade ASC, l.id_lote ASC`,
            [idProduto]
        );

        return lotes;
    }

    async criar(lote) {
        const {
            validade,
            qtd_inicial,
            qtd_atual = qtd_inicial,
            data_recebimento,
            id_produto,
            id_doador
        } = lote;

        const [resultado] = await pool.execute(
            `INSERT INTO Lote (
                validade,
                qtd_inicial,
                qtd_atual,
                data_recebimento,
                id_produto,
                id_doador
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                validade,
                qtd_inicial,
                qtd_atual,
                data_recebimento,
                id_produto,
                id_doador
            ]
        );

        return this.buscarPorId(resultado.insertId);
    }

    async atualizar(id, lote) {
        const {
            validade,
            qtd_inicial,
            qtd_atual,
            data_recebimento,
            id_produto,
            id_doador
        } = lote;

        const [resultado] = await pool.execute(
            `UPDATE Lote
            SET validade = ?,
                qtd_inicial = ?,
                qtd_atual = ?,
                data_recebimento = ?,
                id_produto = ?,
                id_doador = ?
            WHERE id_lote = ?`,
            [
                validade,
                qtd_inicial,
                qtd_atual,
                data_recebimento,
                id_produto,
                id_doador,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    async atualizarQuantidade(id, quantidade) {
        const [resultado] = await pool.execute(
            "UPDATE Lote SET qtd_atual = ? WHERE id_lote = ?",
            [quantidade, id]
        );

        return resultado.affectedRows > 0;
    }

    async excluir(id) {
        const [resultado] = await pool.execute(
            "DELETE FROM Lote WHERE id_lote = ?",
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

module.exports = new LoteDAO();