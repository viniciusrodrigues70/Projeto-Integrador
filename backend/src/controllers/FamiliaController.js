const api = require("./ApiController");

module.exports = {
    listar: api.listarFamilias,
    criar: api.criarFamilia,
    editar: api.editarFamilia,
    remover: api.removerFamilia
};