const { response } = require("express");
const Label = require('../models/Label');
const Client = require("../models/Client");



//getEtiquetas
const getLabels = async( req, res = response) =>{
    const labels = await Label.find();
    res.json({
        ok:true,
        labels
    })
};

//etiquetas por id cliente

//Crear etiqueta
const createLabel = async(req,res = response) =>{
     try {
    const { name, color } = req.body;
    const newLabel = new Label({ name, description, color });
    await newLabel.save();
    res.status(201).json(newLabel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear etiqueta' });
  }
}

const updateLabel = async(req, res = response) =>{
     const {idLabel} = req.params;
     try {
         const label = await Label.findOne({idLabel});
         if(!label){
             //Si no existe el ID
             console.log('Etiqueta no encontrada');
             return res.status(404).json({
                 ok:false,
                 msg: 'Etiqueta no existe 0'
             })
         }
         const newLabel ={
             ...req.body
         }
            //Actualiza la categoria
         const labelUpdate = await Label.findOneAndUpdate({idLabel}, newLabel, {new: true});
         //JSON Update
         res.json({
             ok:true,
             label: labelUpdate
         })
         
     } catch (error) {
         //Si no pasa por try
         res.status(500).json({
             ok:false,
             msg: 'Hable con el administrador'
         })
     }
    
 }
//crear etiqueta y añadir a cliente
const createLabelAndAssign = async( req, res = response) =>{
     try {
    const { name, color, idClient } = req.body;

    // 1. Crear la etiqueta (idLabel se autogenera por el plugin)
    const newLabel = new Label({ name, color });
    await newLabel.save();

    // 2. Buscar cliente por ID
    const client = await Client.findOne({ idClient });
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // 3. Añadir el idLabel al array idLabels sin duplicados
    await Client.findOneAndUpdate(
      { idClient },
      { $addToSet: { idLabels: newLabel.idLabel } },
      { new: true }
    );

    res.status(201).json({ label: newLabel });
  } catch (error) {
    console.error('Error creando etiqueta y asignándola al cliente:', error);
    res.status(500).json({ message: 'Error en el servidor AQUI' });
  }
}
//Actualizar etiquetas del cliente
const updateLabelClient = async (req, res = response) => {
  console.log('PUT recibido:', req.params.id);
  console.log('Actualizando etiquetas del cliente');
  console.log(req.body);
  const { idClient, idLabels  } = req.body;

  try {
  console.log('Actualizando etiquetas del cliente');
  console.log(req.body);
    const client = await Client.findOneAndUpdate(
      { idClient },                    // ← buscamos por ID
      { $set: {idLabels } },       // ← solo actualizamos etiquetas
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        ok: false,
        msg: 'Cliente no encontrado por ID',
      });
    }
    return res.json({
      ok: true,
      client,
    });

  } catch (error) {
    console.error('Error al actualizar cliente', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
    });
  }
};

//Eliminar etiqueta
const deleteLabel = async(req, res = response) =>{
    const {idLabel} = req.params;
    try {
        const label = await Label.findById({idLabel});
        if( !label ){
            return res.status(404).json({
                ok: false,
                msg: 'La etiqueta no existe'
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


module.exports = {
    getLabels,
    createLabel,
    updateLabel,
    createLabelAndAssign,
    updateLabelClient,
    deleteLabel
}
