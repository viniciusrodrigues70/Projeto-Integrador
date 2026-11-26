const express = require("express");
const ProdutoController = require("../controllers/ProdutoController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/", ProdutoController.listar);
router.post("/", ProdutoController.criar);
router.put("/:id", ProdutoController.editar);
router.delete("/:id", ProdutoController.remover);


module.exports = router;