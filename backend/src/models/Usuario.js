class Usuario {
    #id;
    #nome;
    #email;
    #senha;
    #tipo;


    constructor({ id_usuario, id, nome, email, senha, tipo }) {
        this.#id = id_usuario ?? id;
        this.#nome = nome;
        this.#email = email;
        this.#senha = senha;
        this.#tipo = tipo;
    }


    get nome() {
        return this.#nome;
    }


    set nome(valor) {
        this.#nome = valor;
    }


    get id() {
        return this.#id;
    }


    get email() {
        return this.#email;
    }


    set email(valor) {
        this.#email = valor;
    }


    get tipo() {
        return this.#tipo;
    }


    set tipo(valor) {
        this.#tipo = valor;
    }


    get perfil() {
        return "Usuário do Banco Solidário";
    }


    toPublicJSON() {
        return {
            id: this.id,
            nome: this.#nome,
            email: this.#email,
            tipo: this.#tipo,
            perfil: this.perfil
        };
    }


    toJSON() {
        return this.toPublicJSON();
    }


    static criarPerfil(registro) {
        if (registro.tipo === "ADMINISTRADOR") {
            return new UsuarioAdministrador(registro);
        }


        return new UsuarioOperador(registro);
    }
}


class UsuarioAdministrador extends Usuario {
   
    get perfil() {
        return "Área administrativa";
    }
}


class UsuarioOperador extends Usuario {
    get perfil() {
        return "Operação do banco de alimentos";
    }
}


Usuario.Administrador = UsuarioAdministrador;
Usuario.Operador = UsuarioOperador;


module.exports = Usuario;
