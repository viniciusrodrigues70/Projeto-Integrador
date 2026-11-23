class Produto {
  constructor(id_produto, nome, descricao, peso, categoria, quantidade) {
    this.id_produto = id_produto;
    this.nome = nome;
    this.descricao = descricao;
    this.peso = peso;
    this.categoria = categoria;
    this.quantidade = quantidade;
  }
}

module.exports = Produto;