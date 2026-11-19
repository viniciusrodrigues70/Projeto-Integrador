const pool = require("../config/database");


class UsuarioDAO {


    async buscarPorEmail(email) {
        const [r] = await pool.execute(
            "SELECT id_usuario, nome, email, senha, tipo FROM Usuario WHERE LOWER(email) = LOWER(?) LIMIT 1",
            [email]
        );


        return r[0] || null;
    }


    async criar({ nome, email, senha, tipo = "OPERADOR" }) {
        const [r] = await pool.execute(
            "INSERT INTO Usuario(nome, email, senha, tipo) VALUES(?,?,?,?)",
            [nome, email, senha, tipo]
        );


        return {
            id_usuario: r.insertId,
            nome,
            email,
            tipo
        };
    }


    async atualizarSenha(id, senha) {
        await pool.execute(
            "UPDATE Usuario SET senha = ? WHERE id_usuario = ?",
            [senha, id]
        );
    }


    async prepararTabelaRecuperacao() {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS RecuperacaoSenha (
                id_recuperacao INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                token_hash CHAR(64) NOT NULL UNIQUE,
                expira_em DATETIME NOT NULL,
                usado TINYINT(1) NOT NULL DEFAULT 0,
                criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,


                CONSTRAINT fk_recuperacao_usuario
                FOREIGN KEY (id_usuario)
                REFERENCES Usuario(id_usuario)
                ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }


    async salvarToken(id, hash, expira) {
        await pool.execute(
            "DELETE FROM RecuperacaoSenha WHERE id_usuario = ?",
            [id]
        );


        await pool.execute(
            "INSERT INTO RecuperacaoSenha(id_usuario, token_hash, expira_em) VALUES(?,?,?)",
            [id, hash, expira]
        );
    }


    async buscarToken(hash) {
        const [r] = await pool.execute(
            "SELECT id_usuario FROM RecuperacaoSenha WHERE token_hash = ? AND usado = 0 AND expira_em > NOW() LIMIT 1",
            [hash]
        );


        return r[0] || null;
    }


    async consumirToken(hash, id, senha) {
        const c = await pool.getConnection();


        try {
            await c.beginTransaction();


            const [r] = await c.execute(
                "SELECT id_usuario FROM RecuperacaoSenha WHERE token_hash = ? AND id_usuario = ? AND usado = 0 AND expira_em > NOW() FOR UPDATE",
                [hash, id]
            );


            if (!r.length) {
                await c.rollback();
                return false;
            }


            await c.execute(
                "UPDATE Usuario SET senha = ? WHERE id_usuario = ?",
                [senha, id]
            );


            await c.execute(
                "UPDATE RecuperacaoSenha SET usado = 1 WHERE token_hash = ?",
                [hash]
            );


            await c.commit();


            return true;


        } catch (e) {
            await c.rollback();
            throw e;


        } finally {
            c.release();
        }
    }
}


module.exports = new UsuarioDAO();
