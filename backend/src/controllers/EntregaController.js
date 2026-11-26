const api = require("./ApiController");

module.exports = {
    listar: api.listarEntregas,
    historicoFamilia: api.historicoFamilia,
    registrar: api.registrarEntrega
};
