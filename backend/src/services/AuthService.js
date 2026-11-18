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
            throw Object.assign(
                new Error("Informe um e-mail válido."),
                { status: 400 }
            );
        }

        return e;
    }

    validarSenha(s) {
        if (typeof s !== "string" || s.length < 8 || s.length > 72) {
            throw Object.assign(
                new Error("A senha deve ter de 8 a 72 caracteres."),
                { status: 400 }
            );
        }
    }

    async cadastrar({ nome, email, senha }) {
        const n = String(nome || "").trim();
        const e = this.email(email);

        if (n.length < 2 || n.length > 100) {
            throw Object.assign(
                new Error("O nome deve ter de 2 a 100 caracteres."),
                { status: 400 }
            );
        }

        this.validarSenha(senha);

        if (await dao.buscarPorEmail(e)) {
            throw Object.assign(
                new Error("Já existe uma conta com este e-mail."),
                { status: 409 }
            );
        }

        return new Usuario(
            await dao.criar({
                nome: n,
                email: e,
                senha: await bcrypt.hash(senha, 12),
                tipo: "OPERADOR"
            })
        ).toPublicJSON();
    }

    async entrar({ email, senha }) {
        const e = this.email(email);

        if (typeof senha !== "string" || !senha) {
            throw Object.assign(
                new Error("Informe sua senha."),
                { status: 400 }
            );
        }

        const row = await dao.buscarPorEmail(e);

        const ok = row && (
            row.senha.startsWith("$2")
                ? await bcrypt.compare(senha, row.senha)
                : senha === row.senha
        );

        if (!ok) {
            throw Object.assign(
                new Error("E-mail ou senha inválidos."),
                { status: 401 }
            );
        }

        if (!row.senha.startsWith("$2")) {
            await dao.atualizarSenha(
                row.id_usuario,
                await bcrypt.hash(senha, 12)
            );
        }

        const usuario = new Usuario(row).toPublicJSON();

        return {
            token: jwt.sign(
                usuario,
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "8h"
                }
            ),
            usuario
        };
    }

    async solicitarRecuperacao(email) {
        const msg = {
            mensagem: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha."
        };

        const row = await dao.buscarPorEmail(this.email(email));

        if (!row) {
            return msg;
        }

        const token = crypto.randomBytes(32).toString("hex");

        const hash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        await dao.salvarToken(
            row.id_usuario,
            hash,
            new Date(Date.now() + 1800000)
        );

        const base = (
            process.env.FRONTEND_URL || "http://127.0.0.1:5500"
        ).replace(/\/$/, "");

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
                to: row.email,
                subject: "Redefinição de senha | Banco Solidário",

                text: `Olá, ${row.nome}. Redefina sua senha em 30 minutos: ${link}`,

                html: `
                    <p>Olá, ${row.nome}.</p>
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
            throw Object.assign(
                new Error("Link inválido ou expirado."),
                { status: 400 }
            );
        }

        const hash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const row = await dao.buscarToken(hash);

        if (
            !row ||
            !await dao.consumirToken(
                hash,
                row.id_usuario,
                await bcrypt.hash(senha, 12)
            )
        ) {
            throw Object.assign(
                new Error("Link inválido ou expirado."),
                { status: 400 }
            );
        }

        return {
            mensagem: "Senha redefinida. Faça login com sua nova senha."
        };
    }
}

module.exports = new AuthService();