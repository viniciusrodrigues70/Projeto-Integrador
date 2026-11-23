const pool = require("../config/database");

class FamiliaDAO {
    async listarTodos() {
        const [familias] = await pool.execute(
            `SELECT
                id_familia,
                nome_responsavel,
                cpf_responsavel,
                num_integrantes,
                endereco,
                telefone
            FROM Familia
            ORDER BY nome_responsavel ASC`
        );

        return familias;
    }

    async buscarPorId(id) {
        const [familias] = await pool.execute(
            `SELECT
                id_familia,
                nome_responsavel,
                cpf_responsavel,
                num_integrantes,
                endereco,
                telefone
            FROM Familia
            WHERE id_familia = ?
            LIMIT 1`,
            [id]
        );

        return familias[0] || null;
    }

    async buscarPorCPF(cpf) {
        const [familias] = await pool.execute(
            `SELECT
                id_familia,
                nome_responsavel,
                cpf_responsavel,
                num_integrantes,
                endereco,
                telefone
            FROM Familia
            WHERE cpf_responsavel = ?
            LIMIT 1`,
            [cpf]
        );

        return familias[0] || null;
    }

    async criar(familia) {
        const {
            nome_responsavel,
            cpf_responsavel,
            num_integrantes,
            endereco,
            telefone = null
        } = familia;

        const [resultado] = await pool.execute(
            `INSERT INTO Familia (
                nome_responsavel,
                cpf_responsavel,
                num_integrantes,
                endereco,
                telefone
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                nome_responsavel,
                cpf_responsavel,
                num_integrantes,
                endereco,
                telefone
            ]
        );

        return this.buscarPorId(resultado.insertId);
    }

    async atualizar(id, familia) {
        const {
            nome_responsavel,
            cpf_responsavel,
            num_integrantes,
            endereco,
            telefone = null
        } = familia;

        const [resultado] = await pool.execute(
            `UPDATE Familia
            SET nome_responsavel = ?,
                cpf_responsavel = ?,
                num_integrantes = ?,
                endereco = ?,
                telefone = ?
            WHERE id_familia = ?`,
            [
                nome_responsavel,
                cpf_responsavel,
                num_integrantes,
                endereco,
                telefone,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    async excluir(id) {
        const [resultado] = await pool.execute(
            "DELETE FROM Familia WHERE id_familia = ?",
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

module.exports = new FamiliaDAO();