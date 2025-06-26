const { Router } = require("express");
const { check } = require("express-validator");
const { getProducts, createProduct, updateProduct, deleteProduct, productsByIdCategory } = require("../constrollers/products");




//-----Rutas-----
const router = Router();

//Obtener Productos
router.get('/', getProducts);

//Obtener todos los Productos por idCategoria
router.get('/:idCategory', productsByIdCategory)


//Añadir etiqueta
router.post(
    '/',
    [
        check('name', 'El nombre del Producto es obligatorio').not().notEmpty(),
        check('price', 'El precio del Producto es obligatorio').not().notEmpty(),
    ], 
    createProduct);

//Actualizar Producto
router.put('/:idProduct', updateProduct);

//Eliminar Producto
router.delete('/:idProduct', deleteProduct);

module.exports= router;

