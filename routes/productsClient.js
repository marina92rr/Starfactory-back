const { Router } = require("express");
const { getProductsClient, createProductClient, updateProductClient, deleteProductClient, getProductsClientUnpaid, getProductsClientPaid, getAllProductsClient, getMonthlySummary, getPaymentMethodSummary } = require("../constrollers/productsClient");


//-----Rutas-----
const router = Router();

//Obtener Productos cliente
router.get('/:idClient', getProductsClient);

//Obtener todos los Productos cliente por fecha
router.get('/date/:date', getAllProductsClient);

//Obtener productos PAGADOS cliente
router.get('/paid/:idClient', getProductsClientPaid);

//Obtener productos NO PAGADOS cliente
router.get('/unpaid/:idClient', getProductsClientUnpaid);


//Añadir etiqueta
router.post( '/', createProductClient);

//Cambiar etiqueta
router.put('/unpaid/:idProductClient', updateProductClient);

//Eliminar etiqueta
router.delete('/unpaid/:idProductClient', deleteProductClient);

// --- Nueva ruta ---
// Resumen mensual de ventas
// Devuelve un array de objetos con la forma:
// { _id: 'YYYY-MM', totalSales: Number, countSales: Number }
// donde _id representa el mes (por ejemplo, 2025-07) y totalSales es el
// importe total facturado en ese mes (precio − descuento).  countSales es
// el número de ventas pagadas en el periodo.  Si necesitas más
// desgloses (por ejemplo por método de pago), añade nuevas rutas en
// constrollers/productsClient.js siguiendo el mismo patrón.
router.get('/summary/monthly', getMonthlySummary);

// Resumen de ventas por método de pago (global).  Devuelve una
// colección de objetos con la forma:
// { _id: 'efectivo', totalSales: Number, countSales: Number }
// donde _id es el método de pago normalizado.
router.get('/summary/payment-method', getPaymentMethodSummary);

module.exports= router;

