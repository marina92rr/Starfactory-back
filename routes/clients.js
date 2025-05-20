
//-------------------  Rutas de Clientes ------------ hots + /api/clients-----------

const {Router} = require('express'); //Importar ruta
const {check} = require('express-validator');

const { getClients, createClient, updateClient, deleteClient, getClientByDNI } = require('../constrollers/clients');
const { validateFields } = require('../middlewares/validate-fields');

//-----Rutas-----
const router = Router();

//Obtener clientes
router.get( '/', getClients);

//Obtener 1 Cliente
router.get('/:dni', getClientByDNI);

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
router.put( '/:dni', updateClient);

//eliminar cliente
router.delete( '/:dni', deleteClient);

module.exports = router;