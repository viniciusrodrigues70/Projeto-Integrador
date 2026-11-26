const api = require("./ApiController");

module.exports = {
    listar: api.listarLotes,
    registrarDoacao: api.registrarDoacao,
    consultarEstoque: api.consultarEstoque
};