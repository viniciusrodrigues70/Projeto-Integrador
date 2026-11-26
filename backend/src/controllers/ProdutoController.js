const api = require("./ApiController");

module.exports = {
    listar: api.listarProdutos,
    criar: api.criarProduto,
    editar: api.editarProduto,
    remover: api.removerProduto
};