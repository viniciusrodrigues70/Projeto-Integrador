const express = require("express");
const DoadorController = require("../controllers/DoadorController");
const router = express.Router();
router.use(require("../middlewares/authMiddleware"));


router.get("/", DoadorController.listar);
router.post("/", DoadorController.criar);


module.exports = router;