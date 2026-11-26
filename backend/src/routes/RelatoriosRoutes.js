const express = require("express");
const api = require("../controllers/ApiController");
const router = express.Router();


router.use(require("../middlewares/authMiddleware"));
router.get("/dashboard", api.dashboard);
router.get("/vencimentos", api.lotesVencendo);
router.get("/doadores", api.doacoesPorDoador);
router.get("/doacoes-mes", api.doacoesPorMes);
router.get("/familias-mes", api.familiasPorMes);


module.exports = router;