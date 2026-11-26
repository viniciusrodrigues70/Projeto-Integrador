const express = require("express");
const EntregaController = require("../controllers/EntregaController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/", EntregaController.listar);
router.get("/familia/:id", EntregaController.historicoFamilia);
router.post("/", EntregaController.registrar);


module.exports = router;
