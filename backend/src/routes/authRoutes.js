const express = require("express");

const c = require("../controllers/AuthController");
const auth = require("../middlewares/authMiddleware");

const r = express.Router();

r.post("/login", c.login);
r.post("/cadastro", c.cadastro);
r.post("/esqueci-senha", c.esqueciSenha);
r.post("/redefinir-senha", c.redefinirSenha);

r.get("/me", auth, c.perfil);
r.post("/logout", auth, c.logout);

module.exports = r;