const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const h = req.headers.authorization || "";

    const token = h.startsWith("Bearer ")
        ? h.slice(7)
        : "";

    if (!token) {
        return res.status(401).json({
            mensagem: "Faça login para continuar."
        });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);

        next();

    } catch {
        return res.status(401).json({
            mensagem: "Sessão expirada. Entre novamente."
        });
    }
};