const service = require("../services/AuthService");

module.exports = {
    login: async (req, res, next) => {
        try {
            const sessao = await service.entrar(req.body);
            const cookieBase = {
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 8 * 60 * 60 * 1000,
                path: "/"
            };

            res.cookie("bancoSolidarioToken", sessao.token, {
                ...cookieBase,
                httpOnly: true
            });
            res.cookie("bancoSolidarioUsuario", JSON.stringify(sessao.usuario), {
                ...cookieBase,
                httpOnly: false
            });
            res.cookie("bancoSolidarioLogado", "true", {
                ...cookieBase,
                httpOnly: false
            });

            res.json({ usuario: sessao.usuario });
        } catch (e) {
            next(e)
        }
    },


    cadastro: async (req, res, next) => {
        try {
            res.status(201).json({
                mensagem: "Conta criada. Agora você já pode entrar.",
                usuario: await service.cadastrar(req.body)
            });
        } catch (e) {
            next(e)
        }
    },


    esqueciSenha: async (req, res, next) => {
        try {
            res.json(await service.solicitarRecuperacao(req.body.email));
        } catch (e) {
            next(e)
        }
    },


    redefinirSenha: async (req, res, next) => {
        try {
            res.json(await service.redefinirSenha(req.body));
        } catch (e) {
            next(e)
        }
    },


    perfil: (req, res) => {
        res.json({
            usuario: req.usuario
        })
    },


    logout: (req, res) => {
        const cookieBase = {
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/"
        }

        res.clearCookie("bancoSolidarioToken", { ...cookieBase, httpOnly: true });
        res.clearCookie("bancoSolidarioUsuario", { ...cookieBase });
        res.clearCookie("bancoSolidarioLogado", { ...cookieBase });

        res.json({
            mensagem: "Sessão encerrada."
        })
    }
}