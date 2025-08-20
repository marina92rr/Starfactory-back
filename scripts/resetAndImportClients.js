
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const { Types } = require('mongoose');
const Client = require('../models/Client');
const Label = require('../models/Label');

const MONGO_URI = 'mongodb+srv://mern_user:O96Yi8RKanzgJsSS@starfactorydb.zvzy9xe.mongodb.net/mern_starfactory';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB', err);
    process.exit(1);
  });

const filePath = path.join(__dirname, '../rellenar_filled.xlsx');

const workbook = XLSX.readFile(filePath);
const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
console.log(`📄 Registros leídos del Excel: ${excelData.length}`);

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
    if (row['etiquetas']) {
      const etiquetas = row['etiquetas'].split(',').map(e => e.trim());
      etiquetas.forEach(e => {
        if (e) labelSet.add(e);
      });
    }
  }

  return [...labelSet];
}

async function createLabels(uniqueLabels) {
  const labelMap = {}; // name → idLabel

  for (const name of uniqueLabels) {
    const newLabel = new Label({ name, color: generateRandomColor() });
    await newLabel.save();
    labelMap[name] = newLabel.idLabel;
    console.log(`➕ Etiqueta creada: ${name} (idLabel: ${newLabel.idLabel})`);
  }

  return labelMap;
}

async function importClientsWithLabels(labelMap, rows) {
  for (const row of rows) {
    const dni = row['ID'];
    if (!dni) {
      console.warn('⚠️ Cliente sin DNI, omitido');
      continue;
    }

    const etiquetas = (row['etiquetas'] || '').split(',').map(e => e.trim()).filter(Boolean);
    const idLabels = etiquetas.map(e => labelMap[e]).filter(Boolean);

    const clientData = {
      name: row['nombre'] || '',
      lastName: row['apellidos'] || '',
      dni: row['ID'] || new Types.ObjectId(), // Usar columna ID del Excel como DNI
      email: row['email'] || '',
      mainPhone: normalizePhone(row['telefono']),
      optionalPhone: normalizePhone(row['telefono2']),
      isTeacher: false,
      idUser: new Types.ObjectId(), // cumple con el modelo como ObjectId generado
      idProducts: [],
      idLabels
    };

    try {
      const client = new Client(clientData);
      await client.save();
      console.log(`✅ Cliente insertado: ${client.name} ${client.lastName} (DNI: ${dni})`);
    } catch (err) {
      console.error(`❌ Error insertando cliente ${dni}: ${err.message}`);
    }
  }
}

async function run() {
  try {
    console.log('🧹 Eliminando colecciones...');
    await Client.deleteMany({});
    await Label.deleteMany({});
    console.log('✅ Colecciones limpiadas.');

    const uniqueLabels = await extractUniqueLabels(excelData);
    const labelMap = await createLabels(uniqueLabels);
    await importClientsWithLabels(labelMap, excelData);

    console.log('🎉 Importación finalizada correctamente.');
  } catch (err) {
    console.error('❌ Error general:', err);
  } finally {
    mongoose.disconnect();
  }
}

run();
