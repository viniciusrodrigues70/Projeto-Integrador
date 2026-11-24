const express = require("express");
const LoteController = require("../controllers/LoteController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/estoque/produtos", LoteController.listarEstoquePorProduto);
router.get("/", LoteController.listar);
router.post("/doacoes", LoteController.registrarDoacao);


module.exports = router;