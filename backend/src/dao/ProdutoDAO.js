const database = require("../config/database");
const Produto = require("../models/Produto");

class ProdutoDAO {
  erroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.status = 400;
    return erro;
  }

  validar(produto) {
    if (!produto.nome?.trim()) {
      throw this.erroValidacao("O nome do produto é obrigatório.");
    }

    if (!produto.descricao?.trim()) {
      throw this.erroValidacao("A descrição do produto é obrigatória.");
    }

    if (!produto.categoria?.trim()) {
      throw this.erroValidacao("Selecione uma categoria para o produto.");
    }

    if (produto.nome.trim().length > 100 || produto.descricao.trim().length > 300 || produto.categoria.trim().length > 50) {
      throw this.erroValidacao("Nome, descrição ou categoria ultrapassam o tamanho permitido.");
    }

    if (Number(produto.quantidade) < 0 || !Number.isInteger(Number(produto.quantidade))) {
      throw this.erroValidacao("A quantidade deve ser um número inteiro igual ou maior que zero.");
    }

    if (
      produto.peso !== null &&
      produto.peso !== undefined &&
      (isNaN(Number(produto.peso)) || Number(produto.peso) < 0)
    ) {
      throw this.erroValidacao("O peso deve ser um número igual ou maior que zero.");
    }

    if (produto.peso !== null && produto.peso !== undefined && Number(produto.peso) > 999.99) {
      throw this.erroValidacao("O peso deve ser menor que 1000.");
    }
  }

  async inserir(produto, conexao = database) {
    this.validar(produto);

    return conexao.query(
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

  async buscarPorId(id) {
    const [linhas] = await database.query(
      "SELECT * FROM Produto WHERE id_produto = ? LIMIT 1",
      [id]
    );

    return linhas[0] || null;
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
