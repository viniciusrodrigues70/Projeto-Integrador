
const database = require("../config/database");
const ItemEntrega = require("../models/ItemEntrega");

class ItemEntregaDAO {

    validar(item) {
        if (isNaN(item.id_entrega) || !Number.isInteger(Number(item.id_entrega)) || Number(item.id_entrega) <= 0) {
            throw new Error("O ID da entrega é obrigatório.");
        }

        if (isNaN(item.id_produto) || !Number.isInteger(Number(item.id_produto)) || Number(item.id_produto) <= 0) {
            throw new Error("O ID do produto é obrigatório.");
        }

        if (isNaN(item.quantidade) || !Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) <= 0) {
            throw new Error("A quantidade deve ser um número inteiro maior que zero.");
        }
    }

    async inserir(item) {
        this.validar(item);

        return database.query(
            `INSERT INTO Item_Entrega (id_entrega, id_produto, quantidade)
            VALUES (?, ?, ?)`,
            [
                item.id_entrega,
                item.id_produto,
                Number(item.quantidade)
            ]
        );
    }

    async listar() {
        const [linhas] = await database.query(
            "SELECT * FROM Item_Entrega ORDER BY id_item"
        );

        const lista = [];

        for (let i = 0; i < linhas.length; i++) {
            const item = new ItemEntrega(
                linhas[i].id_item,
                linhas[i].id_entrega,
                linhas[i].id_produto,
                linhas[i].quantidade
            );

            lista.push(item);
        }

        return lista;
    }

    async editar(id, item) {
        this.validar(item);

        return database.query(
            `UPDATE Item_Entrega
            SET id_entrega = ?, id_produto = ?, quantidade = ?
            WHERE id_item = ?`,
            [
                item.id_entrega,
                item.id_produto,
                Number(item.quantidade),
                id
            ]
        );
    }

    async remover(id) {
        return database.query(
            "DELETE FROM Item_Entrega WHERE id_item = ?",
            [id]
        );
    }
}

module.exports = new ItemEntregaDAO();
