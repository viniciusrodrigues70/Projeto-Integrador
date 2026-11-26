const api = require("./ApiController");

module.exports = {
    listar: api.listarDoadores,
    criar: api.criarDoador,
    editar: api.editarDoador,
    remover: api.removerDoador
};
