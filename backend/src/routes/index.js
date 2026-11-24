const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const api = require("../controllers/ApiController");

router.use("/auth", require("./authRoutes"));

//Essass rotas precisam do login para rodar

router.use(auth);

router.get("/produtos", api.listarProdutos);
router.post("/produtos", api.criarProduto);
router.put("/produtos/:id", api.editarProduto);
router.delete("/produtos/:id", api.removerProduto);

router.get("/doadores", api.listarDoadores);
router.post("/doadores", api.criarDoador);

router.get("/familias", api.listarFamilias);
router.post("/familias", api.criarFamilia);
router.put("/familias/:id", api.editarFamilia);
router.delete("/familias/:id", api.removerFamilia);

router.get("/lotes", api.listarLotes);
router.post("/lotes", api.registrarDoacao);
router.get("/estoque", api.consultarEstoque);

router.get("/entregas", api.listarEntregas);
router.get("/entregas/familia/:id", api.historicoFamilia);
router.post("/entregas", api.registrarEntrega);

router.get("/relatorios/dashboard", api.dashboard);
router.get("/relatorios/vencimentos", api.lotesVencendo);
router.get("/relatorios/doadores", api.doacoesPorDoador);
router.get("/relatorios/doacoes-mes", api.doacoesPorMes);
router.get("/relatorios/familias-mes", api.familiasPorMes);

module.exports = router;