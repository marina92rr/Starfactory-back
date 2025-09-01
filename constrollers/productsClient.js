const { response } = require("express");
const ProductClient = require('../models/ProductClient');
const Product = require("../models/store/Product");
const Quota = require("../models/rates/Quota");
const SuscriptionClient = require("../models/SuscriptionClient");
const SalesClient = require("../models/SalesClient");



//------------------rescatar TODOS los productos de cliente------------------
const getProductsClient = async (req, res = response) => {
  try {
    const { idClient } = req.params;  //recoger idClient de la URL

    if (!idClient) {
      return res.status(400).json({
        ok: false,
        msg: 'Debe proporcionar un idClient en la URL',
      });
    }

    const productsClient = await ProductClient.find({ idClient: Number(idClient) })
      .sort({ buyDate: -1 });

    res.json({
      ok: true,
      productsClient
    });

  } catch (error) {
    console.error('❌ Error al obtener productos del cliente:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener los productos del cliente',
    });
  }
};


//------------------rescatar TODOS los products clients por fecha------------------
const getAllProductsClient = async (req, res = response) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        ok: false,
        msg: 'Debe proporcionar una fecha en la URL',
      });
    }

    // Suponiendo que recibes la fecha como 'YYYY-MM-DD'
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const productsClient = await ProductClient.find({
      paymentDate: { $gte: start, $lte: end },
      paid: true
    })
      .sort({ buyDate: -1 });

    res.json({
      ok: true,
      productsClient
    });

  } catch (error) {
    console.error('❌ Error al obtener las ventas por fecha:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener las ventas por fecha',
    });
  }
};

//------------------ productos PAGADOS de cliente ------------------
const getProductsClientPaid = async (req, res = response) => {
  try {
    const { idClient } = req.params;
    if (!idClient) {
      return res.status(400).json({ ok: false, msg: 'Debe proporcionar un idClient en la URL' });
    }

    // PAGADOS
    const productsClientPaid = await ProductClient.find({ idClient: Number(idClient), paid: true })
      .sort({ buyDate: -1 });
    return res.json({ ok: true, productsClientPaid });   // 👈 clave EXACTA

  } catch (error) {
    console.error('❌ Error al obtener productos pagados del cliente:', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener los productos pagados del cliente' });
  }
};

//------------------ productos NO PAGADOS de cliente ------------------
const getProductsClientUnpaid = async (req, res = response) => {
  try {
    const { idClient } = req.params;
    if (!idClient) {
      return res.status(400).json({ ok: false, msg: 'Debe proporcionar un idClient en la URL' });
    }
    // NO PAGADOS
    const productsClientUnpaid = await ProductClient.find({ idClient: Number(idClient), paid: false })
      .sort({ buyDate: -1 });
    return res.json({ ok: true, productsClientUnpaid }); // 👈 clave EXACTA


  } catch (error) {
    console.error('❌ Error al obtener productos no pagados del cliente:', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener los productos no pagados del cliente' });
  }
};

//------------------crear producto de cliente------------------
const createAdministrationProductClient = async (req, res) => {
  try {
    const {
      name,
      price,
      paymentMethod,
      paymentDate
    } = req.body;

    //si es negativo resta 
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ ok: false, msg: 'price debe ser un número > 0.' });
    }

    const now = new Date();

    const newEntry = new ProductClient({
      idClient: 0,
      idProduct: 67,
      name: name,
      price: amount,
      discount: 0,
      paymentMethod: paymentMethod.toLowerCase(),
      paid: true,
      idSalesClient: 0,
      buyDate: now,
      paymentDate: paymentDate ?? now
    });


    const saved = await newEntry.save();
    return res.status(201).json({ ok: true, productClient: saved });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al guardar los productos' });
  }
};


//------------------crear producto de cliente------------------
const createProductClient = async (req, res) => {
  try {
    const {
      idClient,
      products,
      paymentMethod,
      paid
    } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: 'Debe enviar un array de productos o cuotas.' });
    }
    const now = new Date();

    const salesClient = new SalesClient({
      idClient: idClient,
      sales: []
    });
    await salesClient.save();

    const newProductClients = await Promise.all(
      products.map(async (product) => {

        const idQuota = product.isProduct === false ? product.idProduct : null;
        const idProduct = product.isProduct === true ? product.idProduct : null;

        const newEntry = new ProductClient({
          idClient,
          idProduct: idProduct,
          idQuota: idQuota,
          name: product.name,
          price: product.price,
          discount: product.discount ?? 0,
          paymentMethod: paymentMethod.toLowerCase(),
          paid,
          idSalesClient: salesClient.idSalesClient,
          buyDate: now,
          paymentDate: paid ? now : null
        });

        // 🔁 Si selfSale está activado y es una cuota, se crea la suscripción
        if (product.selfSale === true && idQuota !== null) {

          const newSubscription = new SuscriptionClient({
            idClient,
            idQuota: idQuota,
            startDate: now,
            price: product.price ?? 0,
            discount: product.discount ?? 0,
            paymentMethod: paymentMethod.toLowerCase(),
            active: true
          });

          await newSubscription.save();
        }

        return await newEntry.save();
      })
    );
    const productsClientForSale = await ProductClient.find({ idSalesClient: Number(salesClient.idSalesClient) });
    salesClient.sales = productsClientForSale;
    await salesClient.save();

    res.status(201).json({ msg: 'Productos guardados correctamente', newProductClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al guardar los productos' });
  }
};



//------------------Actualizar producto de cliente (simple)------------------
const updateProductClient = async (req, res = response) => {
  const { idProductClient } = req.params;
  const { paid } = req.body; // siempre viene

  try {
    // Campos permitidos según paid
    const allowed = paid === false
      ? ['paid', 'paymentMethod']
      : ['name', 'price', 'paymentDate', 'paymentMethod', 'paid'];

    // Construir updateData solo con los campos permitidos presentes en el body
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    // Normalizar método de pago si viene
    if (updateData.paymentMethod) {
      updateData.paymentMethod = String(updateData.paymentMethod).toLowerCase();
    }

    // Si queda pagada y no mandan paymentDate → poner ahora
    if (paid === true && !('paymentDate' in updateData)) {
      updateData.paymentDate = new Date();
    }

    // dentro de tu updateProductClient, tras construir updateData
    if (typeof updateData.paymentDate === 'string' && updateData.paymentDate) {
      // Fuerza la hora a medianoche local/UTC según prefieras
      updateData.paymentDate = new Date(`${updateData.paymentDate}T00:00:00`);
    }
    // Un único update
    const updated = await ProductClient.findOneAndUpdate(
      { idProductClient },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
    }

    res.json({ ok: true, msg: 'Venta actualizada correctamente', venta: updated });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al actualizar la venta', error: error.message });
  }
};

//------------------eliminar productos de cliente------------------
const deleteProductClient = async (req, res = response) => {
  const { idProductClient } = req.params;

  try {

    // Borra SOLO si está impagado
    const removeProductClient = await ProductClient.deleteOne({ idProductClient });

    return res.json({ ok: true, msg: 'Venta impagada eliminada', removeProductClient });


  } catch (e) {
    console.error('Error eliminando impago:', e);
    res.status(500).json({ ok: false, msg: 'Error interno eliminando impago' });
  }
};

//------------------ Resumen mensual de ventas ------------------
// Esta función agrega todas las ventas pagadas agrupándolas por mes (formato YYYY-MM).
// Devuelve el importe total de ventas y el número de operaciones por mes.
const getMonthlySummary = async (req, res = response) => {
  try {
    const summary = await ProductClient.aggregate([
      { $match: { paid: true, paymentDate: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          totalSales: { $sum: { $subtract: ['$price', '$discount'] } },
          countSales: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.json({ ok: true, summary });
  } catch (error) {
    console.error('❌ Error al obtener resumen mensual:', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener resumen mensual' });
  }
};

//------------------ Resumen de ventas por método de pago ------------------
// Agrupa todas las ventas pagadas por el campo paymentMethod, sumando
// el importe neto y el número de operaciones para cada método.  El
// resultado se utiliza en el frontend para mostrar un gráfico de tarta.
const getPaymentMethodSummary = async (req, res = response) => {
  try {
    const summary = await ProductClient.aggregate([
      { $match: { paid: true, paymentDate: { $ne: null } } },
      {
        $group: {
          _id: '$paymentMethod',
          totalSales: { $sum: { $subtract: ['$price', '$discount'] } },
          countSales: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);
    return res.json({ ok: true, summary });
  } catch (error) {
    console.error('❌ Error al obtener resumen por método de pago:', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener resumen por método de pago' });
  }
};

module.exports = {
  getProductsClient,
  getAllProductsClient,
  getProductsClientPaid,
  getProductsClientUnpaid,
  createProductClient,
  updateProductClient,
  deleteProductClient,
  getMonthlySummary,
  getPaymentMethodSummary,
  createAdministrationProductClient
}
