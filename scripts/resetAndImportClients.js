const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Client = require('../models/Client');
const Label = require('../models/Label');

const MONGO_URI = 'mongodb+srv://mern_user:O96Yi8RKanzgJsSS@starfactorydb.zvzy9xe.mongodb.net/mern_starfactory';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar a MongoDB', err));

const filePath = path.join(__dirname, '../star-factory-sevilla_exportacion_clientes_Timp.xls.xlsx');

const workbook = XLSX.readFile(filePath);
const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  return '#' + [...Array(6)].map(() => letters[Math.floor(Math.random() * 16)]).join('');
}

async function extractUniqueLabels(rows) {
  const labelSet = new Set();

  for (const row of rows) {
    if (row['Etiquetas']) {
      const etiquetas = row['Etiquetas'].split(',').map(e => e.trim());
      etiquetas.forEach(e => {
        if (e) labelSet.add(e);
      });
    }
  }

  return [...labelSet];
}

async function createLabels(uniqueLabels) {
  const labelMap = {}; // name -> idLabel

  for (const name of uniqueLabels) {
    const newLabel = new Label({ name, color: generateRandomColor() });
    await newLabel.save();
    labelMap[name] = newLabel.idLabel;
    console.log(`➕ Etiqueta creada: ${name}`);
  }

  return labelMap;
}

async function importClientsWithLabels(labelMap) {
  for (const row of worksheet) {
    const dni = row['DNI'];
    if (!dni) continue;

    const etiquetas = (row['Etiquetas'] || '').split(',').map(e => e.trim()).filter(Boolean);
    const idLabels = etiquetas.map(e => labelMap[e]).filter(Boolean);

    const clientData = {
      name: row['Nombre'] || '',
      lastName: row['Apellidos'] || '',
      dni,
      email: row['Email'] || '',
      mainPhone: normalizePhone(row['Teléfono']),
      optionalPhone: normalizePhone(row['Teléfono alternativo']),
      isTeacher: false,
      idUser: null,
      idProducts: [],
      idLabels
    };

    const client = new Client(clientData);
    await client.save();
    console.log(`✅ Cliente insertado: ${dni}`);
  }
}

async function run() {
  try {
    console.log('🧹 Borrando colecciones...');
    await Client.deleteMany({});
    await Label.deleteMany({});
    console.log('✅ Datos anteriores eliminados.');

    const uniqueLabels = await extractUniqueLabels(worksheet);
    const labelMap = await createLabels(uniqueLabels);
    await importClientsWithLabels(labelMap);

    console.log('🎉 Proceso completo.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

run();
