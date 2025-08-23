const { Router } = require("express");
const { getSuscriptionsByClient, deleteSuscriptionClient, updateSuscriptionClient } = require("../constrollers/suscriptionClient");


//-----Rutas-----
const router = Router();

//Obtener Productos cliente
router.get('/:idClient', getSuscriptionsByClient);


//Añadir etiqueta
//router.post( '/', createProductClient);
//
//Actualizar Tarifa
router.put('/:idSuscriptionClient', updateSuscriptionClient);
////Eliminar etiqueta
router.delete('/:idSuscriptionClient', deleteSuscriptionClient);

module.exports= router;