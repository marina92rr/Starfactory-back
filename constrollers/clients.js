const {response} = require('express');
const Client = require('../models/Client');

//Acciones con Label + Product
const Label = require('../models/Label');
const Product = require('../models/store/Product');
//Utils Baja
const { isActive, isCancelled, isScheduledCancellation } = require('../utils/clientsStatus');
const SuscriptionClient = require('../models/SuscriptionClient');

const getClients = async(req, res = response) =>{
    const clients = await Client.find();

    res.json({
        ok:true,
        clients
    })
}

const getLimitPageClients = async(req, res = response) =>{
    const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const [clients, total] = await Promise.all([
      Client.find().skip(skip).limit(limit),
      Client.countDocuments()
    ]);

    res.json({
      ok: true,
      clients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al cargar clientes' });
  }
};

const getClientByID = async(req, res =response) =>{

    const { idClient } = req.params;
    try {
        const client = await Client.findOne({ idClient });
        if (!client) {
          return res.status(404).json({
            ok: false,
            msg: `Cliente con ID ${idClient} no encontrado.`
          });
        }
        res.json({
          ok: true,
          client
        });
        } catch (error) {
        console.error('Error al obtener cliente por ID:', error);
        res.status(500).json({
          ok: false,
          msg: 'Hable con el administrador'
        });
    }
}

const createClient = async(req, res = response)  =>{
   try {
    const normalizeText = (text) => {
      return text
        .normalize("NFD")                     // separa letras de los acentos
        .replace(/[\u0300-\u036f]/g, "")     // elimina los acentos
        .toUpperCase();                      // convierte a Minusculas
    };

    const normalizedBody = {
      ...req.body,
      name: normalizeText(req.body.name),
      lastName: normalizeText(req.body.lastName),
      email: req.body.email,
      idClient: req.body.idClient, // normaliza el ID si es texto
    };

    const client = new Client(normalizedBody);
    await client.save();

    res.status(200).json({
      ok: true,
      msg: 'Cliente creado con éxito',
      client,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
      error: error.message,
    });
  }
}

const updateClient = async(req, res = response) =>{
    const {idClient} = req.params;
    try {

        const client = await Client.findOne({idClient});
        if(!client){
            //Si no existe el ID
            return res.status(404).json({
                ok:false,
                msg: 'Cliente no existe'
            })
        }

        const newClient ={
            ...req.body
        }

        const clientUpdate = await Client.findOneAndUpdate({idClient}, newClient, {new: true});
        //JSON Update
        res.json({
            ok:true,
            client: clientUpdate
        })
        
    } catch (error) {
        //Si no pasa por try
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
   
}

const deleteClient = async(req, res = response) =>{
    const {idClient} = req.params;
    try {
        await SuscriptionClient.deleteMany({ idClient: Number(idClient) }); // Elimina suscripciones asociadas
        const client = await Client.findOneAndDelete({idClient});
        if( !client ){
            return res.status(404).json({
                ok: false,
                msg: ' El cliente no existe'
            })
        }

         res.json({ok:true});

    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

//---------------LABEL-------------------------

//Obtener datos label del cliente
const getLabelsOfClient = async (req, res) => {
  const idClient = Number(req.params.idClient);
console.log('Recibo idClient:', idClient);

const client = await Client.findOne({ idClient });
console.log('Cliente encontrado:', client);

if (!client) return res.status(404).json({ msg: 'Cliente no encontrado' });

console.log('Consultando etiquetas con:', client.idLabels);

const labels = await Label.find({ idLabel: { $in: client.idLabels } });
console.log('Etiquetas encontradas:', labels);

res.json(labels);
};

//Obtener labels de cliente
const getlabelsToClient = async( req, res= response) =>{
    const { idClient} = req.params;

    try {
        const client = await Client.findOne({idClient})
        .populate('labels');

        if(!client){
            return res.status(404).json({
                ok: false,
                msg: 'Cliente no encontrado'
            })
        }

        const labelsClient = client.labels
        //Array de etiquetas
        res.json({
            ok:true,
            labels: labelsClient
        })
        
    } catch (error) {
         res.status(500).json({ 
            ok:false,
            msg: 'Hable con el administrador' 
        });
    }
}

//Añadir Label a cliente
const addLabelToClient = async(req, res = response) =>{
     try {
    let { idClient, idLabel, idLabels } = req.body;

    // soporta las dos formas: un solo idLabel o un array idLabels
    let labelsToAdd = [];
    if (Array.isArray(idLabels)) {
      labelsToAdd = idLabels.map(Number);
    } else if (idLabel != null) {
      labelsToAdd = [Number(idLabel)];
    } else {
      return res.status(400).json({ message: 'Debes enviar idLabel o idLabels' });
    }

    // 1) Buscamos el cliente
    const client = await Client.findOne({ idClient });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    // 2) Revisa que cada etiqueta exista
    const found = await Label.find({ idLabel: { $in: labelsToAdd } });
    if (found.length !== labelsToAdd.length) {
      return res.status(404).json({ message: 'Alguna de las etiquetas no existe' });
    }

    // 3) Añade los números al array, evitando duplicados
    const updated = await Client.findOneAndUpdate(
      { idClient },
      { $addToSet: { idLabels: { $each: labelsToAdd } } },
      { new: true }
    );

    res.json({ message: 'Etiqueta(s) añadida(s)', client: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

//Eliminar etiquetas de Cliente por ID
const removeLabelToClient = async(req, res= response) =>{
    try {
    const { idClient, idLabel } = req.params;
    const labelNum = Number(idLabel);

    // 0) Validar que idLabel sea un número válido
    if (isNaN(labelNum)) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'idLabel debe ser un número' 
      });
    }

    // 1) Buscar cliente
    const client = await Client.findOne({ idClient });
    if (!client) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'Cliente no encontrado' 
      });
    }

    // 2) Comprobar que la etiqueta exista
    const label = await Label.findOne({ idLabel: labelNum });
    if (!label) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'Etiqueta no encontrada' 
      });
    }

    // 3) Eliminar el número de etiqueta del array (sin $each)
    const updatedClient = await Client.findOneAndUpdate(
      { idClient },
      { $pull: { idLabels: labelNum } },
      { new: true }
    ).populate('labels');  // virtual que mapea idLabels → documentos Label

    // 4) Devolver sólo el array de etiquetas pobladas
    return res.json({
      ok:     true,
      msg:    'Etiqueta eliminada del cliente',
      labels: updatedClient.labels
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok:  false,
      msg: 'Error en el servidor'
    });
  }
}


//Filtrar clientes por etiquetas
const getClientsByLabels = async (req, res = response) => {
   try {
    const { labelIds } = req.body; // array de numbers

    if (!Array.isArray(labelIds) || labelIds.length === 0) {
      return res.status(400).json({ msg: 'No labels provided' });
    }

    // Busca clientes que tengan TODOS los labels seleccionados (en idLabels)
    // $all busca arrays que contengan TODOS los valores
    const clients = await Client.find({
      idLabels: { $all: labelIds }
    });

    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error filtering clients by labels' });
  }
}


//---------------PRODUCT-------------------------
const addProductToClient = async(req, res = response) =>{
    try {
    const { idClient, idProduct } = req.body;

    // 1. Comprueba que exista el cliente
    const client = await Client.findOne({idClient});
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // 2. Comprueba que exista la etiqueta
    const product = await Product.findById(idProduct);
    if (!product) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    // 3. Evita duplicados con $addToSet (solo añade si no existe)
    const updatedClient = await Client.findOneAndUpdate(
      {idClient},
      { $addToSet: { idProducts: idProduct } },
      { new: true }                           // para devolver el documento actualizado
    ).populate('idProducts');                   // opcional: para devolver los datos de las etiquetas

    res.json({
      message: 'Etiqueta añadida al cliente',
      client: updatedClient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

//--------------BAJA/ALTA CLIENTE-------------------
// Cambia el estado de un cliente entre activo y cancelado
const toggleClientStatusCancellation = async (req, res) => {
  const { idClient } = req.params;

  try {
    const id = Number(idClient);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ msg: 'idClient inválido' });
    }

    const client = await Client.findOne({ idClient: id }); // 👈 importante Number
    if (!client) return res.status(404).json({ msg: 'Cliente no encontrado' });

    if (isCancelled(client.dateCancellation)) {
      // Reactivar
      client.dateCancellation = null;
      await client.save();
      return res.json({ msg: 'Cliente reactivado', client });
    }

    // Dar de baja + eliminar TODAS sus suscripciones
    client.dateCancellation = new Date();
    await client.save();

    // Elimina todas las suscripciones del cliente
    const delSuscription = await SuscriptionClient.deleteMany({ idClient: id }); // 👈 
    return res.json({
      msg: 'Cliente dado de baja y suscripciones eliminadas',
      client,
      removedSuscriptions: delSuscription.deletedCount
    });

  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    return res.status(500).json({
      msg: 'Error interno al cambiar estado del cliente',
      error: error.message // 👈 te da la pista exacta
    });
  }
};


//Programa la baja de un cliente para una fecha futura
const programClientCancellation = async (req, res) => {
  const { idClient } = req.params;
  const { cancelDate } = req.body;

 try {
    const client = await Client.findOne({ idClient: parseInt(idClient) });
    if (!client) return res.status(404).json({ msg: 'Cliente no encontrado' });

    // Validar la fecha de entrada
    const futureDate = new Date(cancelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (futureDate <= today) {
      return res.status(400).json({ msg: 'La fecha debe ser futura' });
    }

    // ✅ Evitar sobrescribir si ya tiene una baja programada
    if (isScheduledCancellation(client.dateCancellation)) {
      return res.status(400).json({
        msg: `El cliente ya tiene una baja programada para el ${new Date(client.dateCancellation).toLocaleDateString()}`,
      });
    }

    client.dateCancellation = futureDate;
    await client.save();

    return res.json({ msg: 'Baja programada correctamente', client });
  } catch (error) {
    console.error('Error al programar baja:', error);
    res.status(500).json({ msg: 'Error al programar baja del cliente' });
  }
};

// Cancela la baja programada (pasa dateCancellation a null solo si es futura)
const cancelScheduledCancellation = async (req, res) => {
  const { idClient } = req.params;

  try {
    const client = await Client.findOne({ idClient: parseInt(idClient) });
    if (!client) return res.status(404).json({ msg: 'Cliente no encontrado' });

    if (client.dateCancellation && new Date(client.dateCancellation) > new Date()) {
      client.dateCancellation = null;
      await client.save();
      return res.json({ msg: 'Baja programada cancelada', client });
    } else {
      return res.status(400).json({ msg: 'El cliente no tiene una baja programada futura' });
    }
  } catch (error) {
    console.error('Error al cancelar baja programada:', error);
    res.status(500).json({ msg: 'Error interno al cancelar baja' });
  }
};

//Get clients with future cancellations
const getClientsWithScheduledCancellation = async (req, res) => {
 try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Hoy:', today);

    const clients = await Client.find({
      dateCancellation: { $gt: today },
    });

    console.log('Clientes encontrados:', clients);

    res.json({ clients });
  } catch (error) {
    console.error('Error al obtener clientes con baja programada:', error);
    res.status(500).json({ msg: 'Error interno al obtener clientes', error: error.message });
  }
};



module.exports = {
    getClients,
    getClientByID,
    createClient,
    updateClient,
    deleteClient,
    getLimitPageClients,
    //Baja
    toggleClientStatusCancellation,
    programClientCancellation,
    cancelScheduledCancellation, 
    getClientsWithScheduledCancellation,

    //*LABELS
    getlabelsToClient,
    addLabelToClient,
    removeLabelToClient,
    getLabelsOfClient,
    getClientsByLabels,

    //*PRODUCTS
    addProductToClient
}