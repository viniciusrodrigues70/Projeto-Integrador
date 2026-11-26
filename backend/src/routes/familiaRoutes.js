const express = require("express");
const FamiliaController = require("../controllers/FamiliaController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/", FamiliaController.listar);
router.post("/", FamiliaController.criar);
router.put("/:id", FamiliaController.editar);
router.delete("/:id", FamiliaController.remover);


module.exports = router;