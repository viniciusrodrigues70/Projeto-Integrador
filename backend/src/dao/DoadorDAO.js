
const pool = require("../config/database");
const Doador = require("../models/Doador");

const TIPOS_DOADOR = ["EMPRESA/INSTITUICAO", "PESSOA_FISICA"];

class DoadorDAO {

    validar(doador) {
        if (!doador.nome || !doador.nome.trim()) {
            const erro = new Error("O nome do doador é obrigatório.");
            erro.status = 400;
            throw erro;
        }

        if (!doador.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doador.email.trim())) {
            const erro = new Error("Informe um e-mail válido para o doador.");
            erro.status = 400;
            throw erro;
        }

        if (doador.nome.trim().length > 100 || doador.email.trim().length > 100) {
            const erro = new Error("Nome e e-mail devem ter no máximo 100 caracteres.");
            erro.status = 400;
            throw erro;
        }

        if (doador.telefone && doador.telefone.trim().length > 20) {
            const erro = new Error("O telefone deve ter no máximo 20 caracteres.");
            erro.status = 400;
            throw erro;
        }

        if (!TIPOS_DOADOR.includes(doador.tipo_doador)) {
            const erro = new Error("Selecione um tipo de doador válido.");
            erro.status = 400;
            throw erro;
        }
    }

    async validarEmailUnico(email, id = null) {
        let sql = `SELECT id_doador
            FROM Doador
            WHERE LOWER(email) = LOWER(?)`;
        const valores = [email.trim()];

        if (id !== null) {
            sql += " AND id_doador <> ?";
            valores.push(id);
        }

        sql += " LIMIT 1";

        const [doadores] = await pool.execute(sql, valores);

        if (doadores.length > 0) {
            const erro = new Error("Já existe um doador cadastrado com esse e-mail.");
            erro.status = 409;
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

    async buscarPorId(id) {
        const [doadores] = await pool.execute(
            `SELECT id_doador, nome, email, telefone, tipo_doador
             FROM Doador
             WHERE id_doador = ?
             LIMIT 1`,
            [id]
        );

        return doadores[0] || null;
    }

    async criar(doador) {
        this.validar(doador);
        await this.validarEmailUnico(doador.email);

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

    async atualizar(id, doador) {
        this.validar(doador);
        await this.validarEmailUnico(doador.email, id);

        const telefone = doador.telefone?.trim() || null;
        const [resultado] = await pool.execute(
            `UPDATE Doador
             SET nome = ?, email = ?, telefone = ?, tipo_doador = ?
             WHERE id_doador = ?`,
            [doador.nome.trim(), doador.email.trim(), telefone, doador.tipo_doador, id]
        );

        return resultado.affectedRows > 0;
    }

    async excluir(id) {
        const [resultado] = await pool.execute(
            "DELETE FROM Doador WHERE id_doador = ?",
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

module.exports = new DoadorDAO();