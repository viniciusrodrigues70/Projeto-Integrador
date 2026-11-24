class Doador {
  #id;
  #nome;
  #email;
  #telefone;
  #tipo_doador;

  constructor(id_doador, nome, email, telefone, tipo_doador) {
    if (id_doador && typeof id_doador === "object") {
      const registro = id_doador;
      this.#id = registro.id_doador;
      this.#nome = registro.nome;
      this.#email = registro.email;
      this.#telefone = registro.telefone;
      this.#tipo_doador = registro.tipo_doador;
      return;
    }

    this.#id = id_doador;
    this.#nome = nome;
    this.#email = email;
    this.#telefone = telefone;
    this.#tipo_doador = tipo_doador;
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

  get email() {
    return this.#email;
  }

  set email(valor) {
    this.#email = valor;
  }

  get telefone() {
    return this.#telefone;
  }

  set telefone(valor) {
    this.#telefone = valor;
  }

  get tipo_doador() {
    return this.#tipo_doador;
  }

  set tipo_doador(valor) {
    this.#tipo_doador = valor;
  }

  toJSON() {
    return {
      id_doador: this.#id,
      nome: this.#nome,
      email: this.#email,
      telefone: this.#telefone,
      tipo_doador: this.#tipo_doador,
    };
  }
}

module.exports = Doador;