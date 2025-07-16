
//-------------------  Rutas de Clientes ------------ hots + /api/clients-----------

const {Router} = require('express'); //Importar ruta
const {check} = require('express-validator');

const { getClients, createClient, 
        getlabelsToClient, addLabelToClient, removeLabelToClient,
        updateClient,
        getLimitClients,
        getClientByID,
        toggleClientStatusCancellation,
        programClientCancellation,
        cancelScheduledCancellation,
        getClientsWithScheduledCancellation
 } = require('../constrollers/clients');
const { validateFields } = require('../middlewares/validate-fields');

//-----Rutas-----
const router = Router();

//---------CLIENTES---------------
//Obtener clientes
router.get( '/', getClients);

//Obtener clientes
router.get( '/limit', getLimitClients);

//Obtener 1 Cliente
router.get('/:idClient', getClientByID);

//Actualizar cliente
router.put('/:idClient', updateClient );

//Crear nuevo cliente
router.post('/', createClient);

//---------------Baja---------------

//obtener baja de clientes programada
router.get('/cancel', getClientsWithScheduledCancellation);

//Dar de baja a un cliente
router.patch('/cancel/:idClient', toggleClientStatusCancellation);
//Programar baja
router.patch('/programcancel/:idClient', programClientCancellation);
//Cancelar baja programada
router.patch('/cancelScheduled/:idClient', cancelScheduledCancellation);



//---------------Etiquetas---------------


//Obtener labels de cliente
router.get( '/:idClient/labels', getlabelsToClient);


//añadir label a cliente
router.post( '/label', addLabelToClient);

//Eliminar label de cliente
router.delete( '/label', removeLabelToClient)

module.exports = router;