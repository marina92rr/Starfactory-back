const { Router } = require("express");
const { check } = require("express-validator");
const { getProductsClient, createProductClient, updateProductClient, deleteProductClient } = require("../constrollers/productsClient");


//-----Rutas-----
const router = Router();

//Obtener Productos cliente
router.get('/:idClient', getProductsClient);


//Añadir etiqueta
router.post( '/:idClient', createProductClient);

//Cambiar etiqueta
router.put('/:idProductClient', updateProductClient);

//Eliminar etiqueta
router.delete('/:idProductClient', deleteProductClient);

module.exports= router;

