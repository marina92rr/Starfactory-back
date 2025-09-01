const { response } = require("express");
const Product = require('../models/store/Product');


//getProduct
const getProducts = async( req, res = response) =>{
    const products = await Product.find( { isVisible: true} );
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
            msg: 'Error al crear producto',
            error: error.message
        })
    }
}
//Editar Producto
const updateProduct = async(req,res = response) =>{
    const {idProduct} = req.params;
    try {
        // Buscamos por el campo 'idProduct', no por el '_id' de MongoDB
        const product = await Product.findOne({idProduct});
        if(!product){
            return res.status(404).json({
                ok:false,
                msg: 'El producto no existe'
            })
        }

        const newProduct = {...req.body}
        // Usamos findOneAndUpdate para buscar por un campo que no es el _id
        const productUpdate = await Product.findOneAndUpdate({idProduct}, newProduct, {new:true});
        // Corregido de req.json a res.json
        res.json({
            ok:true,
            product: productUpdate
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Fallo al actualizar producto'
        })
    }
}

//Eliminar Producto
const deleteProduct = async(req, res = response) =>{
    const {idProduct} = req.params;
    try {
        const product = await Product.findOneAndDelete({idProduct});
      
        res.json({
             ok:true,
             msg: 'Producto eliminado',
             product
         });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Error al borrar un producto'
        })
    }
}


//Get Product de ID Categoria
const productsByIdCategory = async(req, res = response) =>{
    const {idCategory} = req.params;

    try {
        const products = await Product.find({ idCategory: idCategory, isVisible: true}).populate('idCategory')
        
        res.status(200).json({

            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Fallo al obtener productos por categoria'
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
