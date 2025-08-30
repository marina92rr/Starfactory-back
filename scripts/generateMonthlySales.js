require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');

// Importar modelos
const SuscriptionClient = require('../models/SuscriptionClient');
const ProductClient     = require('../models/ProductClient');
const BillingLock       = require('../models/BillingLock');
const Quota            = require('../models/rates/Quota');

const MONGO_URI = process.env.DB_CNN;

// Helper para obtener el periodo actual en formato 'YYYY-MM'
function getCurrentPeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Tarea principal que genera las ventas de suscripciones.
 * Se ejecuta para todas las suscripciones activas.
 */
async function generateMonthlySales() {
  console.log('Iniciando tarea de generación de ventas de suscripciones mensuales...');

  await mongoose.connect(MONGO_URI);

  try {
    const period = getCurrentPeriod();
    
    // La fecha de compra es el día 30 del mes actual
    const now = new Date();
    const buyDate = new Date(now.getFullYear(), now.getMonth(), 30, 0, 0, 0);

    // 1. Buscar todas las suscripciones activas
    const activeSubs = await SuscriptionClient.find({ active: true });

    if (!activeSubs.length) {
      console.log('No se encontraron suscripciones activas. Tarea finalizada.');
      return;
    }

    // 2. Cargar los nombres de las cuotas necesarias en una sola consulta
    const quotaIds = [...new Set(activeSubs.map(s => s.idQuota).filter(Boolean))];
    let quotaNameById = new Map();
    if (quotaIds.length) {
      const quotas = await Quota.find({ idQuota: { $in: quotaIds } }, { idQuota: 1, name: 1, _id: 0 });
      quotaNameById = new Map(quotas.map(q => [q.idQuota, q.name]));
    }

    let created = 0, skipped = 0, errors = 0;

    // 3. Procesar cada suscripción
    for (const sub of activeSubs) {
      const lockKey = `sub:${sub.idSuscriptionClient}:${period}`;

      // 3a. Crear un lock para evitar duplicados
      try {
        await BillingLock.create({ key: lockKey, period, idSuscriptionClient: sub.idSuscriptionClient });
      } catch (e) {
        if (e?.code === 11000) { // Error de clave duplicada (E11000)
          console.log(`Omitiendo suscripción ${sub.idSuscriptionClient} para el periodo ${period}: ya procesada.`);
          skipped++;
          continue;
        } else {
          console.error(`[ERROR DE LOCK] Sub ${sub.idSuscriptionClient}:`, e.message);
          errors++;
          continue;
        }
      }

      // 3b. Crear el documento de venta (ProductClient)
      const quotaName = sub.idQuota != null ? quotaNameById.get(sub.idQuota) : null;
      const name = quotaName || 'Suscripción mensual';

      const productDoc = {
        idClient: sub.idClient,
        idProduct: null,
        idQuota: sub.idQuota ?? null,
        name,
        buyDate,
        paymentDate: null,
        price: sub.price,
        discount: 0,
        paymentMethod: sub.paymentMethod || 'efectivo',
        paid: false,
      };

      try {
        await ProductClient.create(productDoc);
        created++;
      } catch (e) {
        errors++;
        console.error(`[ERROR DE VENTA] Sub ${sub.idSuscriptionClient}: Error creando ProductClient:`, e.message);
        // Revertir el lock en caso de error
        try {
          await BillingLock.deleteOne({ key: lockKey });
          console.log(`[ROLLBACK] Lock para sub ${sub.idSuscriptionClient} eliminado.`);
        } catch (rollbackError) {
          console.error(`[FALLO DE ROLLBACK] Sub ${sub.idSuscriptionClient}: No se pudo eliminar el lock. Se requiere limpieza manual para la clave: ${lockKey}`, rollbackError);
        }
      }
    }

    console.log(`[TAREA FINALIZADA] Periodo=${period} -> Creadas: ${created}, Saltadas: ${skipped}, Errores: ${errors}`);

  } catch (jobError) {
    console.error('Ocurrió un error inesperado durante la ejecución de la tarea:', jobError);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión con MongoDB cerrada.');
  }
}

// Programar la tarea para que se ejecute a las 19:05 del día 30 de cada mes.
// Formato Cron: 'minuto hora día-del-mes mes día-de-la-semana'
// '5 19 30 * *' significa a las 19:05 del día 30 del mes.
cron.schedule('0 23 27 * *', () => {
  console.log(`[CRON] Tarea disparada a las ${new Date().toISOString()}`);
  generateMonthlySales();
}, {
  scheduled: true,
  timezone: "Europe/Madrid"
});
console.log('Este script debe mantenerse en ejecución para que el planificador funcione.');

