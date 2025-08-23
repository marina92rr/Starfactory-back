const { Router } = require("express");
const { getProductsClient, createProductClient, updateProductClient, deleteProductClient, getProductsClientUnpaid, getProductsClientPaid } = require("../constrollers/productsClient");


//-----Rutas-----
const router = Router();

//Obtener Productos cliente
router.get('/:idClient', getProductsClient);

//Obtener productos PAGADOS cliente
router.get('/paid/:idClient', getProductsClientPaid);

//Obtener productos NO PAGADOS cliente
router.get('/unpaid/:idClient', getProductsClientUnpaid);


//Añadir etiqueta
router.post( '/', createProductClient);

//Cambiar etiqueta
router.put('/unpaid/:idProductClient', updateProductClient);

//Eliminar etiqueta
router.delete('/unpaid/:idProductClient', deleteProductClient);

module.exports= router;

