const { Router } = require("express");
const { getSuscriptionsByClient, deleteSuscriptionProductClient } = require("../constrollers/suscriptionClient");


//-----Rutas-----
const router = Router();

//Obtener Productos cliente
router.get('/:idClient', getSuscriptionsByClient);


//Añadir etiqueta
//router.post( '/', createProductClient);
//
////Cambiar etiqueta
//router.put('/:idProductClient', updateProductClient);
//
////Eliminar etiqueta
router.delete('/:idSuscriptionClient', deleteSuscriptionProductClient);

module.exports= router;