const { response } = require("express");
const ProductClient = require('../models/ProductClient');


//getEtiquetas
const getProductsClient = async( req, res = response) =>{
    const productsClient = await ProductClient.find();
    res.json({
        ok:true,
        productsClient
    })
};

//etiquetas por id cliente

//crear etiqueta
const createProductClient = async( req, res = response) =>{
    try {
        const productClient = new ProductClient(req.body);
        await productClient.save();
        res.status(400).json({
            ok:true,
            msg: 'Etiqueta creada con éxito', productClient
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
const updateProductClient = async(req,res = response) =>{

    const {idProductClient} = req.params;
    try {
        const productClient = await ProductClient.findById(idProduct);
        if(!productClient){
            return res.status(404).json({
                ok:false,
                msg: 'La etiqueta no existe'
            })
        }
        
        const newProductClient = {
            ...req.body
        }

        const productClientUpdate = await ProductClient.findByIdAndUpdate({idProductClient}, newProductClient, {new:true});

        req.json({
            ok:true,
            label: productClient
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

//Eliminar etiqueta
const deleteProductClient = async(req, res = response) =>{
    const {idProductClient} = req.params;
    try {
        const productClient = await ProductClient.findById({idProductClient});
        if( !productClient){
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
    getProductsClient,
    createProductClient,
    updateProductClient,
    deleteProductClient
}
