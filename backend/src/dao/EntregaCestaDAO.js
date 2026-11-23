const pool = require("../config/database");
const EntregaCesta = require("../models/EntregaCesta");

class EntregaCestaDAO {
    async listarHistoricoPorFamilia(idFamilia) {
        const [entregas] = await pool.execute(
            `SELECT
                e.id_entrega,
                e.data_entrega,
                e.observacao,
                e.id_familia,
                f.nome_responsavel,
                GROUP_CONCAT(
                    CONCAT(p.nome, ' (', ie.quantidade, ')')
                    ORDER BY p.nome SEPARATOR ', '
                ) AS itens
            FROM Entrega_cesta AS e
            INNER JOIN Familia AS f
                ON f.id_familia = e.id_familia
            LEFT JOIN Item_Entrega AS ie
                ON ie.id_entrega = e.id_entrega
            LEFT JOIN Produto AS p
                ON p.id_produto = ie.id_produto
            WHERE e.id_familia = ?
            GROUP BY e.id_entrega, e.data_entrega, e.observacao,
                     e.id_familia, f.nome_responsavel
            ORDER BY e.data_entrega DESC, e.id_entrega DESC`,
            [idFamilia]
        );

        return entregas.map((entrega) => new EntregaCesta(entrega));
    }

    async listarTodas() {
        const [entregas] = await pool.execute(
            `SELECT
                e.id_entrega,
                e.data_entrega,
                e.observacao,
                e.id_familia,
                f.nome_responsavel,
                GROUP_CONCAT(
                    CONCAT(p.nome, ' (', ie.quantidade, ')')
                    ORDER BY p.nome SEPARATOR ', '
                ) AS itens
            FROM Entrega_cesta AS e
            INNER JOIN Familia AS f
                ON f.id_familia = e.id_familia
            LEFT JOIN Item_Entrega AS ie
                ON ie.id_entrega = e.id_entrega
            LEFT JOIN Produto AS p
                ON p.id_produto = ie.id_produto
            GROUP BY e.id_entrega, e.data_entrega, e.observacao,
                     e.id_familia, f.nome_responsavel
            ORDER BY e.data_entrega DESC, e.id_entrega DESC`
        );

        return entregas.map((entrega) => new EntregaCesta(entrega));
    }
}

module.exports = new EntregaCestaDAO();