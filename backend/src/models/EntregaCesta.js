class EntregaCesta {
    #id;
    #idFamilia;
    #dataEntrega;
    #observacao;
    #itens;
    #nomeResponsavel;

    constructor(registro = {}) {
        this.#id = registro.id_entrega ?? registro.id;
        this.#idFamilia = registro.id_familia;
        this.#dataEntrega = registro.data_entrega;
        this.#observacao = registro.observacao || null;
        this.#itens = registro.itens ?? [];
        this.#nomeResponsavel = registro.nome_responsavel;
    }

    get id() {
        return this.#id;
    }

    get id_familia() {
        return this.#idFamilia;
    }

    set id_familia(valor) {
        this.#idFamilia = Number(valor);
    }

    get data_entrega() {
        return this.#dataEntrega;
    }

    set data_entrega(valor) {
        this.#dataEntrega = valor;
    }

    get observacao() {
        return this.#observacao;
    }

    set observacao(valor) {
        this.#observacao = valor || null;
    }

    get itens() {
        return Array.isArray(this.#itens) ? [...this.#itens] : this.#itens;
    }

    set itens(valor) {
        this.#itens = Array.isArray(valor) ? [...valor] : [];
    }

    toJSON() {
        return {
            id_entrega: this.#id,
            data_entrega: this.#dataEntrega,
            observacao: this.#observacao,
            id_familia: this.#idFamilia,
            nome_responsavel: this.#nomeResponsavel,
            itens: this.itens
        };
    }
}

module.exports = EntregaCesta;