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
    const { name, description, color } = req.body;
    const newLabel = new Label({ name, description, color });
    await newLabel.save();
    res.status(201).json(newLabel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear etiqueta' });
  }
}
//crear etiqueta y añadir a cliente
const createLabelAndAssign = async( req, res = response) =>{
     try {
    const { name, description, color, dni } = req.body;

    // 1. Crear la etiqueta (idLabel se autogenera por el plugin)
    const newLabel = new Label({ name, description, color });
    await newLabel.save();

    // 2. Buscar cliente por DNI
    const client = await Client.findOne({ dni });
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // 3. Añadir el idLabel al array idLabels sin duplicados
    await Client.findOneAndUpdate(
      { dni },
      { $addToSet: { idLabels: newLabel.idLabel } },
      { new: true }
    );

    res.status(201).json({ label: newLabel });
  } catch (error) {
    console.error('Error creando etiqueta y asignándola al cliente:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}
//Editar etiqueta
const updateLabel = async(req,res = response) =>{

    const {idLabel} = req.params;
    try {
        const label = await Label.findById(idLabel);
        if(!label){
            return res.status(404).json({
                ok:false,
                msg: 'La etiqueta no existe'
            })
        }
        
        const newLabel = {
            ...req.body
        }

        const labelUpdate = await Label.findByIdAndUpdate({idLabel}, newLabel, {new:true});

        req.json({
            ok:true,
            label: labelUpdate
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

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
    createLabelAndAssign,
    updateLabel,
    deleteLabel
}
