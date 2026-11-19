const service = require("../services/AuthService");


module.exports = {
    login: async (req, res, next) => {
        try {
            res.json(await service.entrar(req.body));
        } catch (e) {
            next(e);
        }
    },


    cadastro: async (req, res, next) => {
        try {
            res.status(201).json({
                mensagem: "Conta criada. Agora você já pode entrar.",
                usuario: await service.cadastrar(req.body)
            });
        } catch (e) {
            next(e);
        }
    },


    esqueciSenha: async (req, res, next) => {
        try {
            res.json(await service.solicitarRecuperacao(req.body.email));
        } catch (e) {
            next(e);
        }
    },


    redefinirSenha: async (req, res, next) => {
        try {
            res.json(await service.redefinirSenha(req.body));
        } catch (e) {
            next(e);
        }
    },


    perfil: (req, res) => {
        res.json({
            usuario: req.usuario
        });
    },


    logout: (req, res) => {
        res.json({
            mensagem: "Sessão encerrada."
        });
    }
};
