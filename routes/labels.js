const { Router } = require("express");
const { getLabels, createLabel, updateLabelClient, deleteLabel, createLabelAndAssign, updateLabel, getClientsWithLabel } = require("../constrollers/labels");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares/validate-fields");
const Label = require("../models/Label");




//-----Rutas-----
const router = Router();

//Obtener Etiquetas
router.get('/', getLabels);

//Obtener numero de clientes con etiqueta
router.get('/countClients', getClientsWithLabel);

//Crear etiqueta
router.post('/', createLabel) 

//Actualizar etiqueta
router.put('/all/:idLabel', updateLabel );
router.delete('/:idLabel', deleteLabel);


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

//Cambiar etiqueta cliente
router.put('/client/:idClient', updateLabelClient);

//Eliminar etiqueta cliente
//router.delete('/:idClient', deleteLabel);

module.exports= router;

