/* eslint-disable no-console */
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const { Types } = require('mongoose');
const Client = require('../models/Client');
const Label = require('../models/Label');

// Recomendado: usa variable de entorno para la URI
const MONGO_URI = process.env.MONGODB_URI ||
  'mongodb+srv://mern_user:O96Yi8RKanzgJsSS@starfactorydb.zvzy9xe.mongodb.net/mern_starfactory';

// ✅ Conexión moderna (sin opciones deprecadas)
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      // Opcional: si no pones el dbName en la URI, puedes pasarlo aquí
      // dbName: 'mern_starfactory',
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB', err);
    process.exit(1);
  }
}

// Ruta al Excel (ajusta si usas otro archivo)
const filePath = path.join(__dirname, '../rellenar_filled.xlsx');

// Lee primera hoja del Excel
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

// Extrae etiquetas únicas del Excel (columna 'Etiquetas')
async function extractUniqueLabels(rows) {
  const labelSet = new Set();

  for (const row of rows) {
    const raw = row['Etiquetas'] || row['etiquetas']; // por si viniera en minúscula
    if (!raw) continue;

    const etiquetas = String(raw)
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    etiquetas.forEach(e => labelSet.add(e));
  }

  return [...labelSet];
}

// Crea (o reutiliza) etiquetas y devuelve un map nombre → idLabel
async function createOrReuseLabels(uniqueLabels) {
  const labelMap = {}; // name → idLabel

  for (const name of uniqueLabels) {
    // Busca si ya existe una etiqueta con ese nombre
    let label = await Label.findOne({ name });
    if (!label) {
      label = new Label({ name, color: generateRandomColor() });
      await label.save();
      console.log(`➕ Etiqueta creada: ${name} (idLabel: ${label.idLabel})`);
    } else {
      console.log(`♻️  Etiqueta reutilizada: ${name} (idLabel: ${label.idLabel})`);
    }
    labelMap[name] = label.idLabel;
  }

  return labelMap;
}

async function importClientsWithLabels(labelMap, rows) {
  for (const row of rows) {
    // Tenías "dni" comentado; si no usas DNI real, usaré la columna ID o genero un ObjectId
    const dni = row['ID'] || '';

    const etiquetas = String(row['Etiquetas'] || '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const idLabels = etiquetas
      .map(e => labelMap[e])
      .filter(Boolean);

    const clientData = {
      name: row['Nombre'] || '',
      lastName: row['Apellidos'] || '',
      dni: dni || new Types.ObjectId(),               // si no hay ID, generamos uno
      email: row['Email'] || '',                      // puede venir vacío
      mainPhone: normalizePhone(row['Telefono']),
      optionalPhone: normalizePhone(row['Telefono2']),
      whatsappPhone: normalizePhone(row['Telefono Whatsapp']),
      idUser: new Types.ObjectId(),                   // cumple con el modelo
      idProducts: [],
      idLabels
    };

    try {
      const client = new Client(clientData);
      await client.save();
      console.log(`✅ Cliente insertado: ${client.name} ${client.lastName} (DNI: ${dni || '—'})`);
    } catch (err) {
      console.error(`❌ Error insertando cliente ${dni || '(sin ID)'}: ${err.message}`);
    }
  }
}

async function run() {
  await connectDB();

  try {
    console.log('🧹 Eliminando colecciones (Client, Label)...');
    await Client.deleteMany({});
    await Label.deleteMany({});
    console.log('✅ Colecciones limpiadas.');

    const uniqueLabels = await extractUniqueLabels(excelData);
    const labelMap = await createOrReuseLabels(uniqueLabels);
    await importClientsWithLabels(labelMap, excelData);

    console.log('🎉 Importación finalizada correctamente.');
  } catch (err) {
    console.error('❌ Error general:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Conexión cerrada');
  }
}

run();
