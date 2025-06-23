const { Router } = require("express");
const { check } = require("express-validator");
const { getQuotas, quotaByIdRate, createQuota, updateQuota, deleteQuota } = require("../constrollers/quotas");




//-----Rutas-----
const router = Router();

//Obtener Productos
router.get('/', getQuotas);

//Obtener todas las cuotas por idfactura
router.get('/:idRate', quotaByIdRate)


//Añadir etiqueta
router.post(
    '/', createQuota);

//Cambiar Producto
router.put('/:idQuota', updateQuota);

//Eliminar Producto
router.delete('/:idQuota', deleteQuota);

module.exports= router;

