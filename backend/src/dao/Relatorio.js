const pool = require("../config/database");

class RelatorioDAO {
    async lotesVencendo(dias = 30) {
        const limite = Math.min(365, Math.max(1, Number(dias) || 30));
        const [lotes] = await pool.execute(
            `SELECT l.id_lote, p.nome AS produto, l.qtd_atual AS quantidade,
                    l.validade, d.nome AS doador,
                    DATEDIFF(l.validade, CURDATE()) AS dias_restantes
             FROM Lote AS l
             INNER JOIN Produto AS p ON p.id_produto = l.id_produto
             INNER JOIN Doador AS d ON d.id_doador = l.id_doador
             WHERE l.qtd_atual > 0
               AND l.validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ${limite} DAY)
             ORDER BY l.validade, l.id_lote`
        );
        return lotes;
    }

    async doacoesPorDoador() {
        const [linhas] = await pool.execute(
            `SELECT d.id_doador, d.nome AS doador, COUNT(l.id_lote) AS lotes,
                    COALESCE(SUM(l.qtd_inicial), 0) AS quantidade_recebida
             FROM Doador AS d
             LEFT JOIN Lote AS l ON l.id_doador = d.id_doador
             GROUP BY d.id_doador, d.nome
             ORDER BY quantidade_recebida DESC, d.nome`
        );
        return linhas;
    }

    async doacoesPorMes() {
        const [linhas] = await pool.execute(
            `SELECT DATE_FORMAT(data_recebimento, '%Y-%m') AS mes,
                    COUNT(*) AS lotes, SUM(qtd_inicial) AS quantidade_recebida
             FROM Lote
             GROUP BY DATE_FORMAT(data_recebimento, '%Y-%m')
             ORDER BY mes DESC`
        );
        return linhas;
    }

    async familiasAtendidasPorMes() {
        const [linhas] = await pool.execute(
            `SELECT DATE_FORMAT(data_entrega, '%Y-%m') AS mes,
                    COUNT(*) AS entregas,
                    COUNT(DISTINCT id_familia) AS familias_atendidas
             FROM Entrega_cesta
             GROUP BY DATE_FORMAT(data_entrega, '%Y-%m')
             ORDER BY mes DESC`
        );
        return linhas;
    }

    async resumo() {
        const [linhas] = await pool.execute(
            `SELECT
                (SELECT COUNT(*) FROM Familia) AS familias,
                (SELECT COUNT(*) FROM Doador) AS doadores,
                (SELECT COUNT(*) FROM Produto) AS produtos,
                (SELECT COUNT(*) FROM Entrega_cesta
                 WHERE YEAR(data_entrega) = YEAR(CURDATE())
                   AND MONTH(data_entrega) = MONTH(CURDATE())) AS entregas_mes,
                (SELECT COUNT(*) FROM Lote
                 WHERE qtd_atual > 0
                   AND validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)) AS lotes_vencendo`
        );
        return linhas[0];
    }
}

module.exports = new RelatorioDAO();