const database = require("../config/database");
const ItemEntrega = require("../models/ItemEntrega");

class ItemEntregaDAO {
  validar(item) {
    if (!Number.isInteger(Number(item.id_produto)) || item.id_produto <= 0) {
      throw new Error("O ID do produto é obrigatório.");
    }

    if (!Number.isInteger(Number(item.quantidade)) || item.quantidade <= 0) {
      throw new Error("A quantidade deve ser um número inteiro maior que zero.");
    }
  }

  async inserir(item) {
    this.validar(item);

    const [resultado] = await database.query(
      `INSERT INTO Item_Entrega (id_produto, quantidade)
       VALUES (?, ?)`,
      [item.id_produto, item.quantidade]
    );

    return resultado.insertId;
  }

  async listar() {
    const [linhas] = await database.query(
      "SELECT * FROM Item_Entrega ORDER BY id_item"
    );

    return linhas.map(
      (item) =>
        new ItemEntrega(
          item.id_item,
          item.id_produto,
          item.quantidade
        )
    );
  }

  async editar(id, item) {
    this.validar(item);

    return database.query(
      `UPDATE Item_Entrega
       SET id_produto = ?, quantidade = ?
       WHERE id_item = ?`,
      [item.id_produto, item.quantidade, id]
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