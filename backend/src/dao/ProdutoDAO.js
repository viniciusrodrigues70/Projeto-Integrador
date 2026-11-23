const database = require("../config/database");
const Produto = require("../models/Produto");

class ProdutoDAO {
  validar(produto) {
    if (!produto.nome?.trim()) {
      throw new Error("O nome do produto é obrigatório.");
    }

    if (!produto.descricao?.trim()) {
      throw new Error("A descrição do produto é obrigatória.");
    }

    if (!produto.categoria?.trim()) {
      throw new Error("A categoria do produto é obrigatória.");
    }

    if (Number(produto.quantidade) < 0 || !Number.isInteger(Number(produto.quantidade))) {
      throw new Error("A quantidade deve ser um número inteiro igual ou maior que zero.");
    }

    if (
      produto.peso !== null &&
      produto.peso !== undefined &&
      (isNaN(Number(produto.peso)) || Number(produto.peso) < 0)
    ) {
      throw new Error("O peso deve ser um número igual ou maior que zero.");
    }
  }

  async inserir(produto) {
    this.validar(produto);

    return database.query(
      `INSERT INTO Produto (nome, descricao, peso, categoria, quantidade)
       VALUES (?, ?, ?, ?, ?)`,
      [
        produto.nome,
        produto.descricao,
        produto.peso ?? null,
        produto.categoria,
        Number(produto.quantidade),
      ]
    );
  }

  async listar() {
    const [linhas] = await database.query(
      "SELECT * FROM Produto ORDER BY nome"
    );

    return linhas.map(
      (p) =>
        new Produto(
          p.id_produto,
          p.nome,
          p.descricao,
          p.peso,
          p.categoria,
          p.quantidade
        )
    );
  }

  async editar(id, produto) {
    this.validar(produto);

    return database.query(
      `UPDATE Produto
       SET nome = ?, descricao = ?, peso = ?, categoria = ?, quantidade = ?
       WHERE id_produto = ?`,
      [
        produto.nome,
        produto.descricao,
        produto.peso ?? null,
        produto.categoria,
        Number(produto.quantidade),
        id,
      ]
    );
  }

  async remover(id) {
    return database.query(
      "DELETE FROM Produto WHERE id_produto = ?",
      [id]
    );
  }
}

module.exports = new ProdutoDAO();