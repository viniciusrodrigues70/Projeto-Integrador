const express = require("express");
const DoadorController = require("../controllers/DoadorController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/", DoadorController.listar);
router.post("/", DoadorController.criar);
router.put("/:id", DoadorController.editar);
router.delete("/:id", DoadorController.remover);

module.exports = router;