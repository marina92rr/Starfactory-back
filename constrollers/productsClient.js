const { response } = require("express");
const ProductClient = require('../models/ProductClient');
const Client = require("../models/Client");
const Product = require("../models/store/Product");
const Quota = require("../models/rates/Quota");



//rescatar productos de cliente
const getProductsClient = async( req, res = response) =>{
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

//crear producto de cliente
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
        const newEntry = new ProductClient({
          idClient,
          idProduct: product.idProduct !== false ? product.idProduct : null,
          idQuota: product.idQuota !== false ? product.idQuota : null,
          name: product.name,
          price: product.price,
          discount: product.discount ?? 0,
          paymentMethod: paymentMethod.toLowerCase(),
          paid,
          buyDate: now,
          paymentDate: paid ? now : null
        });

        return await newEntry.save();
      })
    );

    res.status(201).json(newProductClients);
  } catch (error) {
    console.error('❌ Error al crear productosCliente:', error);
    res.status(500).json({ msg: 'Error al crear registros de venta.', error: error.message });
  }
};
//Cambiar producto de cliente
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

//eliminar productos de cliente
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
