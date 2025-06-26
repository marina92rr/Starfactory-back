const { Router } = require("express");
const { getLabels, createLabel, updateLabelClient, deleteLabel, createLabelAndAssign, updateLabel } = require("../constrollers/labels");
const { check } = require("express-validator");




//-----Rutas-----
const router = Router();

//Obtener Etiquetas
router.get('/', getLabels);

//Crear etiqueta
router.post('/', createLabel) 

//Actualizar etiqueta
router.put('/label/:idLabel', updateLabel );

//Crear/añadir etiqueta a cliente
router.post( '/labelClient', createLabelAndAssign);

//Cambiar etiqueta
router.put('/client/:idClient', updateLabelClient);

//Eliminar etiqueta
router.delete('/:idClient', deleteLabel);

module.exports= router;

