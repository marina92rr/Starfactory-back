const { response } = require("express");
const Product = require('../models/Product');


//getEtiquetas
const getProducts = async( req, res = response) =>{
    const products = await Product.find();
    res.json({
        ok:true,
        products
    })
};

//etiquetas por id cliente

//crear etiqueta
const createProduct = async( req, res = response) =>{
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(400).json({
            ok:true,
            msg: 'Etiqueta creada con éxito', product
        })
        
    } catch (error) {
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador',
            error: error.message
        })
    }
}
//Editar etiqueta
const updateProduct = async(req,res = response) =>{

    const {idProduct} = req.params;
    try {
        const product = await Product.findById(idProduct);
        if(!product){
            return res.status(404).json({
                ok:false,
                msg: 'La etiqueta no existe'
            })
        }
        
        const newProduct = {
            ...req.body
        }

        const productUpdate = await Product.findByIdAndUpdate({idProduct}, newProduct, {new:true});

        req.json({
            ok:true,
            label: productUpdate
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

//Eliminar etiqueta
const deleteProduct = async(req, res = response) =>{
    const {idProduct} = req.params;
    try {
        const product = await Product.findById({idProduct});
        if( !product){
            return res.status(404).json({
                ok: false,
                msg: 'La etiqueta no existe'
            })
        }

         res.json({ok:true});

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
    deleteProduct
}
