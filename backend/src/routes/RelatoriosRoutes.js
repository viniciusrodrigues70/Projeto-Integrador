const express = require("express");
const RelatorioController = require("../controllers/RelatorioController");
const router = express.Router();


router.use(require("../middlewares/authMiddleware"));
router.get("/resumo", RelatorioController.resumo);
router.get("/lotes-vencendo", RelatorioController.lotesVencendo);
router.get("/doacoes-por-doador", RelatorioController.doacoesPorDoador);
router.get("/doacoes-por-mes", RelatorioController.doacoesPorMes);
router.get("/familias-atendidas-por-mes", RelatorioController.familiasAtendidasPorMes);


module.exports = router;