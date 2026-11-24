class Lote {
    #id;
    #idProduto;
    #idDoador;
    #validade;
    #quantidadeInicial;
    #quantidadeAtual;
    #dataRecebimento;
    #nomeProduto;
    #nomeDoador;


    constructor(registro = {}) {
        this.#id = registro.id_lote ?? registro.id;
        this.#idProduto = registro.id_produto;
        this.#idDoador = registro.id_doador;
        this.#validade = registro.validade;
        this.#quantidadeInicial = Number(registro.qtd_inicial);
        this.#quantidadeAtual = Number(registro.qtd_atual);
        this.#dataRecebimento = registro.data_recebimento;
        this.#nomeProduto = registro.produto;
        this.#nomeDoador = registro.doador;
    }


    get id() {
        return this.#id;
    }


    get id_produto() {
        return this.#idProduto;
    }


    set id_produto(valor) {
        this.#idProduto = Number(valor);
    }


    get id_doador() {
        return this.#idDoador;
    }


    set id_doador(valor) {
        this.#idDoador = Number(valor);
    }


    get validade() {
        return this.#validade;
    }


    set validade(valor) {
        this.#validade = valor;
    }


    get qtd_inicial() {
        return this.#quantidadeInicial;
    }


    set qtd_inicial(valor) {
        this.#quantidadeInicial = Number(valor);
    }


    get qtd_atual() {
        return this.#quantidadeAtual;
    }


    set qtd_atual(valor) {
        this.#quantidadeAtual = Number(valor);
    }


    get data_recebimento() {
        return this.#dataRecebimento;
    }


    set data_recebimento(valor) {
        this.#dataRecebimento = valor;
    }


    toJSON() {
        return {
            id_lote: this.#id,
            validade: this.#validade,
            qtd_inicial: this.#quantidadeInicial,
            qtd_atual: this.#quantidadeAtual,
            data_recebimento: this.#dataRecebimento,
            id_produto: this.#idProduto,
            produto: this.#nomeProduto,
            id_doador: this.#idDoador,
            doador: this.#nomeDoador
        };
    }
}


module.exports = Lote;
