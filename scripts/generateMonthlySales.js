// jobs/generateMonthlySales.js
require('dotenv').config();
const mongoose = require('mongoose');
const SuscriptionClient = require('../models/SuscriptionClient');
const ProductClient = require('../models/ProductClient');
const BillingLock = require('../models/BillingLock');
// (Opcional) const Quota = require('../models/Quota');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/starfactory';

function periodOf(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`; // 'YYYY-MM'
}

function buyDate25(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 25, 0, 0, 0);
}

async function run() {
  await mongoose.connect(MONGO_URI);

  const now = new Date();
  const period = periodOf(now);
  const buyDate = buyDate25(now);

  const subs = await SuscriptionClient.find({ active: true });

  let created = 0, skipped = 0, errors = 0;

  for (const s of subs) {
    const key = `sub:${s.idSuscriptionClient}:${period}`;

    // 1) Lock mensual por suscripción (idempotencia)
    try {
      await BillingLock.create({ key, period, idSuscriptionClient: s.idSuscriptionClient });
    } catch (e) {
      if (e?.code === 11000) { skipped++; continue; } // ya generado este mes
      errors++; console.error(`[LOCK] ${key}:`, e.message); continue;
    }

    // 2) Crear ProductClient (SIN idSuscriptionClient)
    let name = 'Suscripción mensual';
    // (Opcional: personalizar con nombre de cuota)
    // try {
    //   if (s.idQuota != null) {
    //     const q = await Quota.findOne({ idQuota: s.idQuota });
    //     if (q?.name) name = `Suscripción: ${q.name}`;
    //   }
    // } catch (_) {}

    const productDoc = {
      idClient: s.idClient,
      idProduct: null,
      idQuota: s.idQuota ?? null,
      name,
      buyDate,
      paymentDate: null,
      price: s.price,
      discount: 0,
      paymentMethod: s.paymentMethod || 'efectivo',
      paid: false,
    };

    try {
      await ProductClient.create(productDoc);
      created++;
    } catch (e) {
      errors++;
      console.error('[SALE] Error creando ProductClient:', e.message);
      // liberar lock para permitir reintento
      try { await BillingLock.deleteOne({ key }); } catch (_) {}
    }
  }

  console.log(`[JOB] ${period} => creadas: ${created}, saltadas: ${skipped}, errores: ${errors}`);

  await mongoose.disconnect();
}

// Ejecutable directo (para pruebas manuales)
if (require.main === module) {
  run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { run };