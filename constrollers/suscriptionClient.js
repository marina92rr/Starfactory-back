const { response } = require('express');
const SuscriptionClient = require("../models/SuscriptionClient");
const Quota = require('../models/rates/Quota');
const Client = require('../models/Client');


//sacar suscripcion por cliente
const getSuscriptionsByClient = async (req, res) => {
  const { idClient } = req.params;

  try {
    const suscriptions = await SuscriptionClient.find({ idClient });

    // Cargar todos los idQuota
    const quotas = await Quota.find({
      idQuota: { $in: suscriptions.map(s => s.idQuota) }
    });

    // Añadir nombre a cada suscripción
    const suscriptionList = suscriptions.map(s => {
      const quota = quotas.find(q => q.idQuota === s.idQuota);
      return {
        ...s.toObject(),
        name: quota ? quota.name : null
      };
    });

    res.json({
      ok: true,
      suscriptions: suscriptionList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al cargar suscripciones' });
  }
};

//Actualizar SuscriptionClient
const updateSuscriptionClient = async (req, res = response) => {
    const { idSuscriptionClient } = req.params;
    try {
        const suscriptionClient = await SuscriptionClient.findOne({ idSuscriptionClient });
        if (!suscriptionClient) {
            //Si no existe el rate
            return res.status(404).json({
                ok: false,
                msg: 'suscripción no existe'
            })
        }
        const newSuscriptionClient = { ...req.body }
        //Actualiza la categoria
        const suscriptionClientUpdate = await SuscriptionClient.findOneAndUpdate({ idSuscriptionClient }, newSuscriptionClient, { new: true });
        //JSON Update
        res.json({
            ok: true,
            suscriptionClient: suscriptionClientUpdate
        })
    } catch (error) {
        //Si no pasa por try
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

// DELETE /suscriptions/:idSuscriptionClient
const deleteSuscriptionClient = async (req, res = response) => {
 const { idSuscriptionClient } = req.params;
    try {
        const suscription = await SuscriptionClient.findOneAndDelete({ idSuscriptionClient });
        if (!suscription) {
            return res.status(404).json({
                ok: false,
                msg: 'La suscripción no existe'
            })
        }
        res.json({
            ok: true,
            msg: 'Suscripción eliminada'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
};



module.exports = {
  getSuscriptionsByClient,
  updateSuscriptionClient,
  deleteSuscriptionClient
};