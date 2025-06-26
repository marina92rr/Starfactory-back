
const { Router} = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../constrollers/category');
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

//Actualizar categoria
router.put('/:idCategory', updateCategory );

//Eliminar Categoria
router.delete('/:idCategory', deleteCategory);

//Eliminar Producto de categoria

module.exports = router;