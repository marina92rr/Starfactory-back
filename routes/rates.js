
const { Router} = require('express');
const { getRates, createRate } = require('../constrollers/rates');


const router = Router();

//Obtener Factura
router.get('/', getRates);


//Añadir factura
router.post('/', createRate);

//Eliminar factura

module.exports = router;