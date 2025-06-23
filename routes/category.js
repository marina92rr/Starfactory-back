
const { Router} = require('express');
const { getCategories, createCategory } = require('../constrollers/category');
const { check } = require('express-validator');


const router = Router();

//Obtener Categorias
router.get('/', getCategories);

//Obtener Producto de categoria


//Añadir Categoria
router.post('/',
    [
        check('description', 'El nombre de la Catería es obligatoria')
    ],
    createCategory
)
//Añadir Producto a Categoria


//Eliminar Categoría

//Eliminar Producto de categoria

module.exports = router;