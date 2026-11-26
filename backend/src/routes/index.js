const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const api = require("../controllers/ApiController");

router.use("/auth", require("./authRoutes"));

router.use("/produtos", require("./produtoRoutes"));
router.use("/doadores", require("./doadorRoutes"));
router.use("/familias", require("./familiaRoutes"));
router.use("/lotes", require("./loteRoutes"));
router.use("/entregas", require("./entregaRoutes"));
router.use("/relatorios", require("./RelatoriosRoutes"));

router.get("/estoque", auth, api.consultarEstoque);

module.exports = router;