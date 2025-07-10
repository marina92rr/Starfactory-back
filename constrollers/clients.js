const {response} = require('express');
const Client = require('../models/Client');

//Acciones con Label + Product
const Label = require('../models/Label');
const Product = require('../models/store/Product');

const getClients = async(req, res = response) =>{
    const clients = await Client.find();

    res.json({
        ok:true,
        clients
    })
}

const getLimitClients = async(req, res = response) =>{
    const clients = await Client.find().limit(30);

    res.json({
        ok:true,
        clients
    })
}



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

//-------------BAJA--------------------
const getClientsCancellationsFuture = async(req, res =response) =>{
    const { date } = req.params; // Espera una fecha en formato YYYY-MM-DD
    try {
        const clients = await Client.find({
            dateCancellation: { $gte: new Date(date) }
        });

        if (clients.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron clientes con cancelaciones futuras.'
            });
        }
        res.json({
            ok: true,
            clients
        });
    } catch (error) {
        console.error('Error al obtener clientes con cancelaciones futuras:', error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
    });
  }
}

//---------------LABEL-------------------------

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
}

module.exports = {
    getClients,
    getClientByID,
    createClient,
    updateClient,
    deleteClient,
    getLimitClients,
    //Baja
    getClientsCancellationsFuture,

    //*LABELS
    getlabelsToClient,
    addLabelToClient,
    removeLabelToClient,

    //*PRODUCTS
    addProductToClient
}