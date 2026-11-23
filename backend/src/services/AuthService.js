
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const dao = require("../dao/UsuarioDAO");
const Usuario = require("../models/Usuario");

class AuthService {

    email(v) {
        const e = String(v || "").trim().toLowerCase();

        if (e.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
            const erro = new Error("Informe um e-mail válido.");
            erro.status = 400;
            throw erro;
        }

        return e;
    }

    validarSenha(s) {
        if (typeof s !== "string" || s.length < 8 || s.length > 72) {
            const erro = new Error("A senha deve ter de 8 a 72 caracteres.");
            erro.status = 400;
            throw erro;
        }
    }

    async cadastrar({ nome, email, senha }) {
        const n = String(nome || "").trim();
        const e = this.email(email);

        if (n.length < 2 || n.length > 100) {
            const erro = new Error("O nome deve ter de 2 a 100 caracteres.");
            erro.status = 400;
            throw erro;
        }

        this.validarSenha(senha);

        const usuarioExistente = await dao.buscarPorEmail(e);

        if (usuarioExistente) {
            const erro = new Error("Já existe uma conta com este e-mail.");
            erro.status = 409;
            throw erro;
        }

        const senhaCriptografada = await bcrypt.hash(senha, 12);

        const novoUsuario = await dao.criar({
            nome: n,
            email: e,
            senha: senhaCriptografada,
            tipo: "OPERADOR"
        });

        return new Usuario(novoUsuario).toPublicJSON();
    }

    async entrar({ email, senha }) {
        const e = this.email(email);

        if (typeof senha !== "string" || !senha) {
            const erro = new Error("Informe sua senha.");
            erro.status = 400;
            throw erro;
        }

        const usuario = await dao.buscarPorEmail(e);

        let senhaCorreta = false;

        if (usuario) {
            if (usuario.senha.startsWith("$2")) {
                senhaCorreta = await bcrypt.compare(senha, usuario.senha);
            } else {
                senhaCorreta = senha === usuario.senha;
            }
        }

        if (!senhaCorreta) {
            const erro = new Error("E-mail ou senha inválidos.");
            erro.status = 401;
            throw erro;
        }

        if (!usuario.senha.startsWith("$2")) {
            const novaSenha = await bcrypt.hash(senha, 12);

            await dao.atualizarSenha(
                usuario.id_usuario,
                novaSenha
            );
        }

        const dadosUsuario = new Usuario(usuario).toPublicJSON();

        const token = jwt.sign(
            dadosUsuario,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "8h"
            }
        );

        return {
            token: token,
            usuario: dadosUsuario
        };
    }

    async solicitarRecuperacao(email) {
        const msg = {
            mensagem: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha."
        };

        const usuario = await dao.buscarPorEmail(this.email(email));

        if (!usuario) {
            return msg;
        }

        const token = crypto.randomBytes(32).toString("hex");

        const hash = crypto.createHash("sha256")
            .update(token)
            .digest("hex");

        const dataExpiracao = new Date(Date.now() + 1800000);

        await dao.salvarToken(
            usuario.id_usuario,
            hash,
            dataExpiracao
        );

        let base = process.env.FRONTEND_URL || "http://127.0.0.1:5500";

        base = base.replace(/\/$/, "");

        const link = `${base}/frontend/public/paginas/redefinir-senha.html?token=${token}`;

        if (
            process.env.SMTP_HOST &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASSWORD
        ) {
            const mail = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            });

            await mail.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: usuario.email,
                subject: "Redefinição de senha | Banco Solidário",

                text: `Olá, ${usuario.nome}. Redefina sua senha em 30 minutos: ${link}`,

                html: `
                    <p>Olá, ${usuario.nome}.</p>
                    <p>
                        <a href="${link}">Redefinir senha</a>.
                        Válido por 30 minutos.
                    </p>
                `
            });

        } else if (process.env.NODE_ENV !== "production") {
            msg.linkDesenvolvimento = link;

        } else {
            throw new Error("Envio de e-mail não configurado.");
        }

        return msg;
    }

    async redefinirSenha({ token, senha }) {
        this.validarSenha(senha);

        if (typeof token !== "string" || token.length !== 64) {
            const erro = new Error("Link inválido ou expirado.");
            erro.status = 400;
            throw erro;
        }

        const hash = crypto.createHash("sha256")
            .update(token)
            .digest("hex");

        const usuario = await dao.buscarToken(hash);

        if (!usuario) {
            const erro = new Error("Link inválido ou expirado.");
            erro.status = 400;
            throw erro;
        }

        const senhaCriptografada = await bcrypt.hash(senha, 12);

        const resultado = await dao.consumirToken(
            hash,
            usuario.id_usuario,
            senhaCriptografada
        );

        if (!resultado) {
            const erro = new Error("Link inválido ou expirado.");
            erro.status = 400;
            throw erro;
        }

        return {
            mensagem: "Senha redefinida. Faça login com sua nova senha."
        };
    }
}

module.exports = new AuthService();
