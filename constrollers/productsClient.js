const { response } = require("express");
const ProductClient = require('../models/ProductClient');
const Client = require("../models/Client");
const Product = require("../models/store/Product");
const Quota = require("../models/rates/Quota");



//getEtiquetas
const getProductsClient = async( req, res = response) =>{
    const {idClient} = req.params;
    const productsClient = await ProductClient.find({ idClient: parseInt(idClient) });
    res.json({
        ok:true,
        productsClient
    })
};

//etiquetas por id cliente
const createProductClient = async (req, res = response) => {
  const { idClient } = req.params;
  const { idProduct, idQuota, ...rest } = req.body;

  try {
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

    const productClient = new ProductClient({
      idClient: parseInt(idClient),
      idProduct: finalIdProduct,
      idQuota: finalIdQuota,
      ...rest // Aquí se inyectan name, price, discount, paymentDate, etc.
    });

    await productClient.save();

    res.status(201).json({
      ok: true,
      msg: 'Venta registrada con éxito',
      productClient
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: 'Error al registrar la venta',
      error: error.message
    });
  }
};
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

    // Asignar campos actualizados
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
