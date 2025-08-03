const  { response} = require('express');
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

module.exports = {
  getSuscriptionsByClient
};