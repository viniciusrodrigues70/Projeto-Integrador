const express = require("express");
const ProdutoController = require("../controllers/ProdutoController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/", ProdutoController.listar);
router.post("/", ProdutoController.criar);


module.exports = router;