class Produto {
    #id;
    #nome;
    #descricao;
    #peso;
    #categoria;
    #quantidade;


    constructor(id_produto, nome, descricao, peso, categoria, quantidade) {
        this.#id = id_produto;
        this.#nome = nome;
        this.#descricao = descricao;
        this.#peso = peso;
        this.#categoria = categoria;
        this.#quantidade = Number(quantidade);
    }


    get id() {
        return this.#id;
    }


    get nome() {
        return this.#nome;
    }


    set nome(valor) {
        this.#nome = valor;
    }


    get descricao() {
        return this.#descricao;
    }


    set descricao(valor) {
        this.#descricao = valor;
    }


    get peso() {
        return this.#peso;
    }


    set peso(valor) {
        this.#peso = valor;
    }


    get categoria() {
        return this.#categoria;
    }


    set categoria(valor) {
        this.#categoria = valor;
    }


    get quantidade() {
        return this.#quantidade;
    }


    set quantidade(valor) {
        this.#quantidade = Number(valor);
    }


    toJSON() {
        return {
            id_produto: this.#id,
            nome: this.#nome,
            descricao: this.#descricao,
            peso: this.#peso,
            categoria: this.#categoria,
            quantidade: this.#quantidade
        };
    }
}


module.exports = Produto;
