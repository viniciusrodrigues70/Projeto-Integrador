
const pool = require("../config/database");
const Doador = require("../models/Doador");

const TIPOS_DOADOR = ["EMPRESA/INSTITUICAO", "PESSOA_FISICA"];

class DoadorDAO {

    validar(doador) {
        if (!doador.nome || doador.nome.trim() === "" ||
            !doador.email || doador.email.trim() === "") {

            const erro = new Error("Nome e e-mail do doador são obrigatórios.");
            erro.status = 400;
            throw erro;
        }

        if (!TIPOS_DOADOR.includes(doador.tipo_doador)) {
            const erro = new Error("Selecione um tipo de doador válido.");
            erro.status = 400;
            throw erro;
        }
    }

    async listar() {
        const [doadores] = await pool.execute(
            `SELECT id_doador, nome, email, telefone, tipo_doador
            FROM Doador ORDER BY nome ASC`
        );

        const lista = [];

        for (let i = 0; i < doadores.length; i++) {
            const doador = new Doador(doadores[i]);
            lista.push(doador);
        }

        return lista;
    }

    async criar(doador) {
        this.validar(doador);

        let telefone = null;

        if (doador.telefone && doador.telefone.trim() !== "") {
            telefone = doador.telefone.trim();
        }

        const [resultado] = await pool.execute(
            `INSERT INTO Doador (nome, email, telefone, tipo_doador)
            VALUES (?, ?, ?, ?)`,
            [
                doador.nome.trim(),
                doador.email.trim(),
                telefone,
                doador.tipo_doador
            ]
        );

        return resultado.insertId;
    }
}

module.exports = new DoadorDAO();