// jobs/generateMonthlySales.js
require('dotenv').config();
const mongoose = require('mongoose');
const SuscriptionClient = require('../models/SuscriptionClient');
const ProductClient = require('../models/ProductClient');
const BillingLock = require('../models/BillingLock');
const Quota = require('../models/rates/Quota');

const MONGO_URI = process.env.DB_CNN;

function periodOf(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`; // 'YYYY-MM'
}

function buyDate25(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 25, 0, 0, 0);
}

async function run() {
  await mongoose.connect(process.env.DB_CNN);

  const now = new Date();
  const period = periodOf(now);
  const buyDate = buyDate25(now);

  const subs = await SuscriptionClient.find({ active: true });

  // --- Cargar nombres de cuotas en un solo query ---
 const quotaIds = [...new Set(subs.map(s => s.idQuota).filter(q => q != null))];
 let quotaNameById = new Map();
 if (quotaIds.length) {
   const quotas = await Quota.find({ idQuota: { $in: quotaIds } }, { idQuota: 1, name: 1, _id: 0 });
   quotaNameById = new Map(quotas.map(q => [q.idQuota, q.name]));
 }

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

    
   // Nombre basado en la cuota si existe:
   const quotaName = s.idQuota != null ? quotaNameById.get(s.idQuota) : null;
   const name = quotaName ? `${quotaName}` : 'Suscripción mensual';

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