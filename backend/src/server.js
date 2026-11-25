const path=require("path");
require("dotenv").config({path:path.resolve(__dirname,"../.env")});

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const dao = require("./dao/UsuarioDAO");

if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "gere-uma-chave-longa-e-aleatoria"
) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Configure um JWT_SECRET forte para produção.");
    }

    process.env.JWT_SECRET = "chave-local-mude-antes-de-publicar";
}

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.split(",").map(x => x.trim())
            : true,
        credentials: true
    })
);

app.use(express.json({ limit: "20kb" }));

app.use("/api", require("./routes"));

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use((e, req, res, next) => {
    console.error(e);

    const s = e.status || (
        ["ER_DUP_ENTRY", "ER_ROW_IS_REFERENCED_2", "ER_NO_REFERENCED_ROW_2"].includes(e.code)
            ? 409
            : 500
    );

    res.status(s).json({
        mensagem: e.code === "ER_DUP_ENTRY"
            ? "Já existe um cadastro com esse valor."
            : ["ER_ROW_IS_REFERENCED_2", "ER_NO_REFERENCED_ROW_2"].includes(e.code)
                ? "Não é possível remover este registro porque ele está vinculado a outros dados."
                : s === 500
                ? "Não foi possível concluir a solicitação."
                : e.message
    });
});

const port = Number(process.env.PORT) || 3000;

(async () => {
    await pool.query("SELECT 1");

    await dao.prepararTabelaRecuperacao();

    app.listen(port, () => {
        console.log(`API disponível na porta ${port}`);
    });

})().catch(e => {
    console.error(
        "Falha ao iniciar API; confira MySQL e .env:",
        e.message
    );

    process.exit(1);
})