const { Router } = require("express");
const { check } = require("express-validator");
const { getProductsClient, createProductClient, updateProductClient, deleteProductClient } = require("../constrollers/productsClient");


//-----Rutas-----
const router = Router();

//Obtener Etiquetas
router.get('/', getProductsClient);


//Añadir etiqueta
router.post(
    '/',
    [
        check('name', 'El nombre del Producto es obligatorio').not().notEmpty(),
        check('price', 'El precio del Producto es obligatorio').not().notEmpty(),
    ], 
    createProductClient);

//Cambiar etiqueta
router.put('/:id', updateProductClient);

//Eliminar etiqueta
router.delete('/:id', deleteProductClient);

module.exports= router;

