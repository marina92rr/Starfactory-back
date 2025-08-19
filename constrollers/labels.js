const { response } = require("express");
const Label = require('../models/Label');
const Client = require("../models/Client");



//getEtiquetas
const getLabels = async (req, res = response) => {
  const labels = await Label.find();
  res.json({
    ok: true,
    labels
  })
};

//etiquetas por id cliente

//Crear etiqueta
const createLabel = async (req, res = response) => {
   try {
    let { name, color, description } = req.body || {};
    name = (name ?? '').trim();
    if (!name) {
      return res.status(400).json({ ok: false, errors: { name: { msg: 'El nombre es obligatorio' } } });
    }

    // Unicidad por nombre (case-insensitive con collation)
    const dup = await Label.findOne({ name })
      .collation({ locale: 'es', strength: 2 })
      .lean();
    if (dup) {
      return res.status(400).json({ ok: false, errors: { name: { msg: 'Ya existe una etiqueta con ese nombre' } } });
    }

    // El plugin de autoincremento rellena idLabel automáticamente
    const label = await Label.create({
      name,
      color: color || '#087990',
      ...(description ? { description } : {})
    });

    return res.status(201).json({ ok: true, label });
  } catch (err) {
    console.error('createLabel error', err);
    return res.status(500).json({ ok: false, msg: 'Error al crear etiqueta' });
  }
}

const getClientsWithLabel = async (req, res = response) => {
  try {
    // 1) Todas las etiquetas
    const allLabels = await Label.find({}).lean();

    // 2) Conteo de miembros por idLabel NUMÉRICO desde Client.idLabels
    const counts = await Client.aggregate([
      { $unwind: '$idLabels' },
      { $group: { _id: '$idLabels', memberCount: { $sum: 1 } } }
    ]);

    // 3) Pasar conteos a mapa (clave numérica)
    const countMap = new Map(counts.map(c => [Number(c._id), c.memberCount]));

    // 4) Combinar: para cada etiqueta, buscar su count por idLabel
    const labelsWithCounts = allLabels.map(l => ({
      ...l,
      memberCount: countMap.get(Number(l.idLabel)) || 0
    }));

    res.json({ ok: true, labels: labelsWithCounts });
  } catch (err) {
    console.error('getLabelsWithCounts error', err);
    res.status(500).json({ ok: false, msg: 'Error al obtener etiquetas con conteo' });
  }
}

const updateLabel = async (req, res) => {
  try {
    const idLabel = Number(req.params.idLabel);
    if (Number.isNaN(idLabel)) {
      return res.status(400).json({ ok: false, msg: 'idLabel inválido' });
    }

    // Campos permitidos
    const allowed = ['name', 'color', 'description'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] != null) update[k] = req.body[k];
    }

    // No permitir cambiar idLabel
    if ('idLabel' in req.body) delete req.body.idLabel;

    // Validar duplicado de nombre (case-insensitive)
    if (update.name) {
      const dup = await Label.findOne({
        idLabel: { $ne: idLabel },
        name: update.name
      })
      .collation({ locale: 'es', strength: 2 })  // insensible a mayúsc/minúsculas
      .lean();

      if (dup) {
        return res.status(400).json({
          ok: false,
          errors: { name: { msg: 'Ya existe una etiqueta con ese nombre' } }
        });
      }
    }

    const updated = await Label.findOneAndUpdate(
      { idLabel },
      { $set: update },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ ok: false, msg: 'Etiqueta no encontrada' });
    }

    return res.json({ ok: true, label: updated });
  } catch (err) {
    console.error('updateLabel error', err);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar etiqueta', error: err.message });
  }
};
//crear etiqueta y añadir a cliente
const createLabelAndAssign = async (req, res = response) => {
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
  const { idClient, idLabels } = req.body;

  try {
    console.log('Actualizando etiquetas del cliente');
    console.log(req.body);
    const client = await Client.findOneAndUpdate(
      { idClient },                    // ← buscamos por ID
      { $set: { idLabels } },       // ← solo actualizamos etiquetas
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
const deleteLabel = async (req, res = response) => {
  const idLabel = Number(req.params.idLabel);
  try {

    const deleted = await Label.findOneAndDelete({ idLabel }).lean();
    if (!deleted) return res.status(404).json({ ok: false, msg: 'Etiqueta no encontrada' });

    const pullRes = await Client.updateMany(
      { idLabels: idLabel },
      { $pull: { idLabels: idLabel } }
    );

    res.json({
      ok: true,
      idLabel,
      removedFromClients: pullRes.modifiedCount || 0,
      msg: 'Etiqueta eliminada y desasignada de los clientes'
    });
  } catch (err) {
    console.error('deleteLabelAndUnassign error', err);
    res.status(500).json({ ok: false, msg: 'Error al eliminar etiqueta' });
  }
}


module.exports = {
  getLabels,
  getClientsWithLabel,
  createLabel,
  updateLabel,
  createLabelAndAssign,
  updateLabelClient,
  deleteLabel
}
