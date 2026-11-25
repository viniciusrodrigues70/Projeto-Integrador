const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const h = req.headers.authorization || "";
    const authorizationToken = h.startsWith("Bearer ")
        ? h.slice(7)
        : "";
    const cookieHeader = req.headers.cookie || "";
    const cookies = {};

    for (const parte of cookieHeader.split(";")) {
        const [nome, ...valor] = parte.trim().split("=");
        if (nome) {
            cookies[nome] = valor.join("=");
        }
    }

    const token = cookies.bancoSolidarioToken || authorizationToken;

    if (!token) {
        return res.status(401).json({
            mensagem: "Faça login para continuar."
        });
    }

    try {
        req.usuario = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET);

        next();

    } catch {
        return res.status(401).json({
            mensagem: "Sessão expirada. Entre novamente."
        });
    }
};