const express = require("express");
const LoteController = require("../controllers/LoteController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/estoque", LoteController.consultarEstoque);
router.get("/estoque/produtos", LoteController.consultarEstoque);
router.get("/", LoteController.listar);
router.post("/", LoteController.registrarDoacao);
router.post("/doacoes", LoteController.registrarDoacao);


module.exports = router;