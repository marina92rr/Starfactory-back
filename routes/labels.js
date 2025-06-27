const { Router } = require("express");
const { getLabels, createLabel, updateLabelClient, deleteLabel, createLabelAndAssign, updateLabel } = require("../constrollers/labels");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares/validate-fields");
const Label = require("../models/Label");




//-----Rutas-----
const router = Router();

//Obtener Etiquetas
router.get('/', getLabels);

//Crear etiqueta
router.post('/', createLabel) 

//Actualizar etiqueta
router.put('/label/:idLabel', updateLabel );

//Crear/añadir etiqueta a cliente
router.post( 
    '/assign',
    [ check('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .custom(async (name) => {
        const exists = await Label.findOne({ name });
        if (exists) {
          throw new Error(`La etiqueta "${name}" ya existe`);
        }
      }), validateFields
    ]
    ,createLabelAndAssign);

//Cambiar etiqueta
router.put('/client/:idClient', updateLabelClient);

//Eliminar etiqueta
router.delete('/:idClient', deleteLabel);

module.exports= router;

