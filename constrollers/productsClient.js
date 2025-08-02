const { response } = require("express");
const ProductClient = require('../models/ProductClient');
const Product = require("../models/store/Product");
const Quota = require("../models/rates/Quota");
const SuscriptionClient = require("../models/SuscriptionClient");



//------------------rescatar productos de cliente------------------
const getProductsClient = async (req, res = response) => {
  try {
    const { idClient } = req.params;  //recoger idClient de la URL

    if (!idClient) {
      return res.status(400).json({
        ok: false,
        msg: 'Debe proporcionar un idClient en la URL',
      });
    }

    const productsClient = await ProductClient.find({ idClient: Number(idClient) });

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
          buyDate: now,
          paymentDate: paid ? now : null
        });

        // 🔁 Si selfSale está activado y es una cuota, se crea la suscripción
        if (product.selfSale === true && idQuota !== null) {

          const price = product.price - (parseFloat(product.discount) || 0);

          const newSubscription = new SuscriptionClient({
            idClient,
            idQuota: idQuota,
            startDate: now,
            price,
            paymentMethod: paymentMethod.toLowerCase(),
            active: true
          });

          await newSubscription.save();
        }

        return await newEntry.save();
      })
    );

    res.status(201).json({ msg: 'Productos guardados correctamente', newProductClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al guardar los productos' });
  }
};

//------------------Cambiar producto de cliente------------------
const updateProductClient = async (req, res = response) => {
  const { idProductClient } = req.params;
  const { idProduct, idQuota, ...rest } = req.body;

  try {
    const venta = await ProductClient.findById(idProductClient);
    if (!venta) {
      return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
    }

    // Validaciones cruzadas
    if (idProduct && idQuota) {
      return res.status(400).json({
        ok: false,
        msg: 'Solo puedes enviar un producto o una cuota, no ambos.'
      });
    }

    if (!idProduct && !idQuota) {
      return res.status(400).json({
        ok: false,
        msg: 'Debes enviar al menos un producto o una cuota.'
      });
    }

    let finalIdProduct = null;
    let finalIdQuota = null;

    if (idProduct) {
      const product = await Product.findById(idProduct);
      if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });
      finalIdProduct = product.idProduct;
    }

    if (idQuota) {
      const cuota = await Quota.findById(idQuota);
      if (!cuota) return res.status(404).json({ msg: 'Cuota no encontrada' });
      finalIdQuota = cuota.idQuota;
    }

    // ------------------Asignar campos actualizados------------------
    Object.assign(venta, {
      idProduct: finalIdProduct,
      idQuota: finalIdQuota,
      ...rest
    });

    await venta.save();

    res.json({
      ok: true,
      msg: 'Venta actualizada correctamente',
      venta
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar la venta',
      error: error.message
    });
  }
};

//------------------eliminar productos de cliente------------------
const deleteProductClient = async (req, res = response) => {
  const { idProductClient } = req.params;

  try {
    const venta = await ProductClient.findByIdAndDelete(idProductClient);
    if (!venta) {
      return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
    }

    res.json({
      ok: true,
      msg: 'Venta eliminada correctamente',
      venta
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: 'Error al eliminar la venta',
      error: error.message
    });
  }
};


module.exports = {
  getProductsClient,
  createProductClient,
  updateProductClient,
  deleteProductClient
}
