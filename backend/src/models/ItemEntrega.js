class ItemEntrega {
  #id;
  #idEntrega;
  #idProduto;
  #quantidade;

  constructor(id_item, id_entrega, id_produto, quantidade) {
    this.#id = id_item;
    this.#idEntrega = id_entrega;
    this.#idProduto = id_produto;
    this.#quantidade = Number(quantidade);
  }

  get id() {
    return this.#id;
  }

  get idEntrega() {
    return this.#idEntrega;
  }

  set idEntrega(valor) {
    this.#idEntrega = valor;
  }

  get idProduto() {
    return this.#idProduto;
  }

  set idProduto(valor) {
    this.#idProduto = valor;
  }

  get quantidade() {
    return this.#quantidade;
  }

  set quantidade(valor) {
    this.#quantidade = Number(valor);
  }

  toJSON() {
    return {
      id_item: this.#id,
      id_entrega: this.#idEntrega,
      id_produto: this.#idProduto,
      quantidade: this.#quantidade,
    };
  }
}

module.exports = ItemEntrega;