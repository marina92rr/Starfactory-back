const { response } = require("express");
const Product = require('../models/store/Product');
const res = require("express/lib/response");


//getProduct
const getProducts = async( req, res = response) =>{
    const products = await Product.find();
    res.json({
        ok:true,
        products
    })
};

//Productos por id cliente

//crear Producto
const createProduct = async( req, res = response) =>{
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(200).json({
            ok:true,
            msg: 'Producto creado con éxito', 
            product
        })
        
    } catch (error) {
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador',
            error: error.message
        })
    }
}
//Editar Producto
const updateProduct = async(req,res = response) =>{
    const {idProduct} = req.params;
    try {
        const product = await Product.findById(idProduct);
        if(!product){
            return res.status(404).json({
                ok:false,
                msg: 'El producto no existe'
            })
        }

        const newProduct = {
            ...req.body
        }
        const productUpdate = await Product.findByIdAndUpdate({idProduct}, newProduct, {new:true});
        req.json({
            ok:true,
            product: productUpdate
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

//Eliminar Producto
const deleteProduct = async(req, res = response) =>{
    const {idProduct} = req.params;
    try {
        const product = await Product.findOneAndDelete({idProduct});
        if( !product){
            return res.status(404).json({
                ok: false,
                msg: 'El producto no existe'
            })
        }
        res.json({
             ok:true,
             msg: 'Producto eliminado'
         });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}


//Get Product de ID Categoria
const productsByIdCategory = async(req, res = response) =>{
    const {idCategory} = req.params;

    try {
        const products = await Product.find({ idCategory: idCategory}).populate('idCategory')
        
        res.status(200).json({

            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
        
    }
}


module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    productsByIdCategory
}
