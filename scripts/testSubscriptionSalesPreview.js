require('dotenv').config();
const minimist = require('minimist');
const mongoose = require('mongoose');

const SuscriptionClient = require('../models/SuscriptionClient');
const Quota = require('../models/rates/Quota');

const MONGO_URI = process.env.DB_CNN;

function nowPeriod(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function parseDateYMD(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

function buyDateFromPeriod(period) {
  const [yStr, mStr] = period.split('-');
  const y = Number(yStr);
  const m = Number(mStr) - 1; // 0-based
  return new Date(y, m, 30, 0, 0, 0);
}

async function main() {
  const args = minimist(process.argv.slice(2));
  const idClient = Number(args.idClient ?? args.client);
  if (!idClient || Number.isNaN(idClient)) {
    console.error('Falta --idClient=ID (numérico). Ej: node scripts/testSubscriptionSalesPreview.js --idClient=42');
    process.exit(1);
  }

  const period = args.period || nowPeriod();
  const buyDate = args.date ? parseDateYMD(args.date) : buyDateFromPeriod(period);

  await mongoose.connect(MONGO_URI);

  const subs = await SuscriptionClient.find({ idClient, active: true });
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

  console.log(`Previsualización para idClient=${idClient}, periodo=${period}:`);
  for (const s of subs) {
    const lockKey = `sub:${s.idSuscriptionClient}:${period}`;
    const quotaName = s.idQuota != null ? quotaNameById.get(s.idQuota) : null;
    const name = quotaName || 'Suscripción mensual';
    const productDoc = {
      idClient: s.idClient,
      idProduct: null,
      idQuota: s.idQuota ?? null,
      name,
      buyDate,
      paymentDate: null,
      price: s.price,
      discount: s.discount ?? 0,
      paymentMethod: s.paymentMethod || 'efectivo',
      paid: false,
    };
    console.log('---');
    console.log('Lock:', lockKey);
    console.log('ProductClient:', productDoc);
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

