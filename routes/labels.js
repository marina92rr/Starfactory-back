const { Router } = require("express");
const { getLabels, createLabel, updateLabel, deleteLabel, createLabelAndAssign } = require("../constrollers/labels");
const { check } = require("express-validator");




//-----Rutas-----
const router = Router();

//Obtener Etiquetas
router.get('/', getLabels);

//Crear etiqueta
router.post('/', createLabel) 

//Crear/añadir etiqueta a cliente
router.post( '/create-and-assign', createLabelAndAssign);

//Cambiar etiqueta
router.put('/:id', updateLabel);

//Eliminar etiqueta
router.delete('/:id', deleteLabel);

module.exports= router;

