
const { Router} = require('express');
const { getRates, createRate, updateRate, deleteRate } = require('../constrollers/rates');


const router = Router();

//Obtener Tarifa
router.get('/', getRates);


//Añadir Tarifa
router.post('/', createRate);

//Actualizar Tarifa
router.put('/:idRate', updateRate);

//Eliminar Tarifa
router.delete('/:idRate', deleteRate);

module.exports = router;