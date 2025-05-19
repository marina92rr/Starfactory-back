
//-------------------  Rutas de Clientes ------------ hots + /api/clients-----------

const {Router} = require('express'); //Importar ruta
const {check} = require('express-validator');

const { getClients, createClient, updateClient, deleteClient } = require('../constrollers/clients');
const { validateFields } = require('../middlewares/validate-fields');


//-----Rutas-----
const router = Router();

//Obtener clientes
router.get( '/', getClients);

//Crear nuevo cliente
router.post( 
    '/',
    [
        check('name', 'El nombre del alumno es obligatorio').not().notEmpty(),
        check('lastName', 'El Apellido del alumno es obligatorio').not().notEmpty(),
        check('dni', 'El dni del alumno es obligatorio').not().notEmpty(),
        check('email', 'El email del alumno es obligatorio').isEmail(),
        check('mainPhone', 'El teléfono del alumno es obligatorio').not().notEmpty(),
        validateFields
    ],
     createClient);

//Actualizar cliente
router.put( '/:id', updateClient);

//eliminar cliente
router.delete( '/:id', deleteClient);

module.exports = router;