// jobs/generateClientSubscriptionSales.js
require('dotenv').config();
const minimist = require('minimist');
const mongoose = require('mongoose');

const SuscriptionClient = require('../models/SuscriptionClient');
const ProductClient     = require('../models/ProductClient');
const BillingLock       = require('../models/BillingLock');
const Quota            = require('../models/rates/Quota');

const MONGO_URI = process.env.DB_CNN;

const args = minimist(process.argv.slice(2));
/**
 * Flags:
 *   --idClient=123          (REQUIRED) cliente objetivo
 *   --period=YYYY-MM        (opcional) por defecto mes actual
 *   --date=YYYY-MM-DD       (opcional) fecha de compra; por defecto el día 25 del mes de `period`
 *   --test                  (opcional) crea ventas marcadas como [TEST] y locks con sufijo -TEST
 *   --dry-run               (opcional) no escribe nada, solo muestra lo que haría
 *   --only=ID_SUB           (opcional) ejecuta solo para una suscripción concreta (idSuscriptionClient)
 *   --force                 (opcional) ignora el lock (¡cuidado: puede duplicar!)
 */

function nowPeriod(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function defaultBuyDateFromPeriod(period) {
  // periodo 'YYYY-MM' → fecha 25 a las 00:00:00 de ese mes
  const [yStr, mStr] = period.split('-');
  const y = Number(yStr);
  const m = Number(mStr) - 1; // 0-based
  return new Date(y, m, 25, 0, 0, 0);
}

function parseDateYMD(s) {
  // 'YYYY-MM-DD'
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m - 1), d, 0, 0, 0);
}

async function run() {
  // Validación de flags
  const idClient = Number(args.idClient ?? args.client);
  if (!idClient || Number.isNaN(idClient)) {
    console.error('Falta --idClient=ID (numérico). Ej: node scripts/generateClientSubscriptionSales.js --idClient=42');
    process.exit(1);
  }

  const isTest = !!args.test;
  const dryRun = !!args['dry-run'];
  const onlySub = args.only ? Number(args.only) : null;
  const force = !!args.force;

  const periodBase = args.period || nowPeriod(new Date());
  const period = isTest ? `${periodBase}-TEST` : periodBase;

  const buyDate = args.date
    ? parseDateYMD(args.date)
    : defaultBuyDateFromPeriod(periodBase); // usamos el 25 del mes del periodo base

  await mongoose.connect(MONGO_URI);

  // Traer suscripciones activas del cliente
  const subQuery = { idClient, active: true };
  const subs = await SuscriptionClient.find(subQuery);

 // --- Cargar nombres de cuotas en un solo query ---
 const quotaIds = [...new Set(subs.map(s => s.idQuota).filter(q => q != null))];
 let quotaNameById = new Map();
 if (quotaIds.length) {
   const quotas = await Quota.find({ idQuota: { $in: quotaIds } }, { idQuota: 1, name: 1, _id: 0 });
   quotaNameById = new Map(quotas.map(q => [q.idQuota, q.name]));
 }

  if (!subs.length) {
    console.log(`No hay suscripciones activas para idClient=${idClient}.`);
    await mongoose.disconnect();
    return;
  }

  let created = 0, skipped = 0, errors = 0;

  for (const s of subs) {
    if (onlySub && s.idSuscriptionClient !== onlySub) continue;

    // Preparar lock por suscripción y periodo
    const key = `sub:${s.idSuscriptionClient}:${period}`;

    /*if (dryRun) {
     const quotaName = s.idQuota != null ? quotaNameById.get(s.idQuota) : null;
     const name = isTest
       ? `[TEST] ${quotaName ? `Suscripción: ${quotaName}` : 'Suscripción mensual'}`
       :        (quotaName ? `Suscripción: ${quotaName}` : 'Suscripción mensual');
      console.log('[DRY-RUN] -> LOCK:', key);
      console.log('[DRY-RUN] -> ProductClient:', {
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
      });
      continue;
    }*/

    // Crear lock (salvo --force)
    if (!force) {
      try {
        await BillingLock.create({ key, period, idSuscriptionClient: s.idSuscriptionClient });
      } catch (e) {
        if (e?.code === 11000) { // ya existe → ya generado antes
          skipped++;
          continue;
        } else {
          errors++;
          console.error(`[LOCK] ${key}:`, e.message);
          continue;
        }
      }
    }
   // Nombre basado en la cuota si existe:
   const quotaName = s.idQuota != null ? quotaNameById.get(s.idQuota) : null;
   const name = quotaName ? `${quotaName}` : 'Suscripción mensual';
    // Componer documento de venta
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
      // rollback del lock si no usamos --force
      if (!force) {
        try { await BillingLock.deleteOne({ key }); } catch (_) {}
      }
    }
  }

  console.log(`[JOB by idClient=${idClient}] period=${period} -> creadas: ${created}, saltadas: ${skipped}, errores: ${errors}`);

  await mongoose.disconnect();
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { run };
