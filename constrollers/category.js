
const  { response} = require('express');
const Category = require('../models/store/Category');


//CATEGORY

//obtener categorias
const getCategories = async( req, res= response) =>{
    const categories = await Category.find();
    res.json({
        ok: true,
        categories
    })
}

//Crear Categorias
const createCategory =async( req, res = response) =>{

    try {

        const category = new Category(req.body);
        await category.save();
        res.status(400).json({
            ok:true,
            msg: 'Etiqueta creada con éxito',
            category

        })
        
    } catch (error) {
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador',
            error: error.message
        })
        
    }
}

//PRODUCT





module.exports = {
    getCategories,
    createCategory
}