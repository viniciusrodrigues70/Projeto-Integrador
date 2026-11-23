class Familia {
    #id;
    #nomeResponsavel;
    #cpfResponsavel;
    #numIntegrantes;
    #endereco;
    #telefone;

    constructor(registro = {}) {
        this.#id = registro.id_familia ?? registro.id;
        this.#nomeResponsavel = registro.nome_responsavel;
        this.#cpfResponsavel = registro.cpf_responsavel;
        this.#numIntegrantes = Number(registro.num_integrantes);
        this.#endereco = registro.endereco;
        this.#telefone = registro.telefone || null;
    }

    get id() {
        return this.#id;
    }

    get nome_responsavel() {
        return this.#nomeResponsavel;
    }

    set nome_responsavel(valor) {
        this.#nomeResponsavel = valor;
    }

    get cpf_responsavel() {
        return this.#cpfResponsavel;
    }

    set cpf_responsavel(valor) {
        this.#cpfResponsavel = valor;
    }

    get num_integrantes() {
        return this.#numIntegrantes;
    }

    set num_integrantes(valor) {
        this.#numIntegrantes = Number(valor);
    }

    get endereco() {
        return this.#endereco;
    }

    set endereco(valor) {
        this.#endereco = valor;
    }

    get telefone() {
        return this.#telefone;
    }

    set telefone(valor) {
        this.#telefone = valor || null;
    }

    toJSON() {
        return {
            id_familia: this.#id,
            nome_responsavel: this.#nomeResponsavel,
            cpf_responsavel: this.#cpfResponsavel,
            num_integrantes: this.#numIntegrantes,
            endereco: this.#endereco,
            telefone: this.#telefone
        };
    }
}

module.exports = Familia;