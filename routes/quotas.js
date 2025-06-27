const { Router } = require("express");
const { check } = require("express-validator");
const { getQuotas, quotaByIdRate, createQuota, updateQuota, deleteQuota } = require("../constrollers/quotas");




//-----Rutas-----
const router = Router();

//Obtener cuotas
router.get('/', getQuotas);

//Obtener todas las cuotas por idfactura
router.get('/:idRate', quotaByIdRate)


//Añadir cuota
router.post('/', createQuota);

//Actualizar cuota
router.put('/:idQuota', updateQuota);

//Eliminar cuota
router.delete('/:idQuota', deleteQuota);

module.exports= router;

