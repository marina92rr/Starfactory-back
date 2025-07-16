

const mongoose = require('mongoose');
const Client = require('../models/Client'); // ruta a tu modelo
require('dotenv').config(); // si usas .env para MONGODB_URI

const run = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN);

    const clientsToUpdate = await Client.find({ dateRegister: { $exists: false } });

    for (const client of clientsToUpdate) {
      const creationDate = client._id.getTimestamp(); // fecha de creación del ObjectId
      client.dateRegister = creationDate;
      await client.save();
    }

    console.log(`Actualizados ${clientsToUpdate.length} clientes.`);
    process.exit(0);
  } catch (err) {
    console.error('Error actualizando clientes:', err);
    process.exit(1);
  }
};

run();