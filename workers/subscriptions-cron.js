// workers/subscriptions-cron.js
require('dotenv').config();
const cron = require('node-cron');
const { run } = require('../scripts/generateMonthlySales');

// Programa: día 25 a las 00:05, TZ Madrid
cron.schedule('5 0 25 * *', async () => {
  try { await run(); } catch (e) { console.error('[CRON]', e.message); }
}, { timezone: 'Europe/Madrid' });

console.log('[CRON] Worker de suscripciones iniciado (Europe/Madrid).');

// Opcional para pruebas: descomenta para ejecutar al arrancar
// run().catch(e => console.error('[INIT RUN]', e.message));