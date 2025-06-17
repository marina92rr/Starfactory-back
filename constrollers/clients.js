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



const getClientByDNI = async(req, res =response) =>{

    const { dni } = req.params;
    try {
        const client = await Client.findOne({ dni });
        if (!client) {
          return res.status(404).json({
            ok: false,
            msg: `Cliente con DNI ${dni} no encontrado.`
          });
        }
        res.json({
          ok: true,
          client
        });
        } catch (error) {
        console.error('Error al obtener cliente por DNI:', error);
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
        .toLowerCase();                      // convierte a minúsculas
    };

    const normalizedBody = {
      ...req.body,
      name: normalizeText(req.body.name),
      lastName: normalizeText(req.body.lastName),
      email: normalizeText(req.body.email),
      dni: req.body.dni?.toLowerCase(), // normaliza el DNI si es texto
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

    const {dni} = req.params;
    
    try {

        const client = await Client.findOne({dni});
        if(!client){
            //Si no existe el dni
            return res.status(404).json({
                ok:false,
                msg: 'Cliente no existe'
            })
        }

        const newClient ={
            ...req.body
        }

        const clientUpdate = await Client.findOneAndUpdate({dni}, newClient, {new: true});
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
    const {dni} = req.params;
    try {
        const client = await Client.findOneAndDelete({dni});
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

//Obtener labels de cliente
const getlabelsToClient = async( req, res= response) =>{
    const { dni} = req.params;

    try {
        const client = await Client.findOne({dni})
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
    let { dni, idLabel, idLabels } = req.body;

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
    const client = await Client.findOne({ dni });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    // 2) Revisa que cada etiqueta exista
    const found = await Label.find({ idLabel: { $in: labelsToAdd } });
    if (found.length !== labelsToAdd.length) {
      return res.status(404).json({ message: 'Alguna de las etiquetas no existe' });
    }

    // 3) Añade los números al array, evitando duplicados
    const updated = await Client.findOneAndUpdate(
      { dni },
      { $addToSet: { idLabels: { $each: labelsToAdd } } },
      { new: true }
    );

    res.json({ message: 'Etiqueta(s) añadida(s)', client: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

//Eliminar etiquetas de Cliente por DNI
const removeLabelToClient = async(req, res= response) =>{
    try {
    const { dni, idLabel } = req.params;
    const labelNum = Number(idLabel);

    // 0) Validar que idLabel sea un número válido
    if (isNaN(labelNum)) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'idLabel debe ser un número' 
      });
    }

    // 1) Buscar cliente
    const client = await Client.findOne({ dni });
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
      { dni },
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
    const { dni, idProduct } = req.body;

    // 1. Comprueba que exista el cliente
    const client = await Client.findOne({dni});
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
      {dni},
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
    getClientByDNI,
    createClient,
    updateClient,
    deleteClient,
    getLimitClients,

    //*LABELS
    getlabelsToClient,
    addLabelToClient,
    removeLabelToClient,

    //*PRODUCTS
    addProductToClient
}