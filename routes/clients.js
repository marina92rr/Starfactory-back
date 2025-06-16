
//-------------------  Rutas de Clientes ------------ hots + /api/clients-----------

const {Router} = require('express'); //Importar ruta
const {check} = require('express-validator');

const { getClients, createClient, getClientByDNI, 
        getlabelsToClient, addLabelToClient, removeLabelToClient,
        updateClient,
        
 } = require('../constrollers/clients');
const { validateFields } = require('../middlewares/validate-fields');

//-----Rutas-----
const router = Router();

//---------CLIENTES---------------
//Obtener clientes
router.get( '/', getClients);

//Obtener 1 Cliente
router.get('/:dni', getClientByDNI);

//Actualizar cliente
router.put('/:dni', updateClient );


//Crear nuevo cliente
router.post( 
    '/',
    [
        check('dni', 'El dni del alumno es obligatorio').not().notEmpty(),
        validateFields
    ],
     createClient);



//---------Etiquetas---------------


//Obtener labels de cliente
router.get( '/:dni/labels', getlabelsToClient);


//añadir label a cliente
router.post( '/label', addLabelToClient);

//Eliminar label de cliente
router.delete( '/label', removeLabelToClient)

module.exports = router;