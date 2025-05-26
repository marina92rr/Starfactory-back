const { Router } = require("express");
const { check } = require("express-validator");
const { getProducts, createProduct, updateProduct, deleteProduct } = require("../constrollers/products");




//-----Rutas-----
const router = Router();

//Obtener Etiquetas
router.get('/', getProducts);


//Añadir etiqueta
router.post(
    '/',
    [
        check('name', 'El nombre del Producto es obligatorio').not().notEmpty(),
        check('price', 'El precio del Producto es obligatorio').not().notEmpty(),
    ], 
    createProduct);

//Cambiar etiqueta
router.put('/:id', updateProduct);

//Eliminar etiqueta
router.delete('/:id', deleteProduct);

module.exports= router;

