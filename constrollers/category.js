
const  { response} = require('express');
const Category = require('../models/store/Category');


//CATEGORY

//obtener categorias
const getCategories = async( req, res= response) =>{
    const categories = await Category.find({ isVisible: true });
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

 const updateCategory = async(req, res = response) =>{
     const {idCategory} = req.params;
     try {
         const category = await Category.findOne({idCategory});
         if(!category){
             //Si no existe el ID
             return res.status(404).json({
                 ok:false,
                 msg: 'Categoría no existe'
             })
         }
         const newCategory ={
             ...req.body
         }
            //Actualiza la categoria
         const categoryUpdate = await Category.findOneAndUpdate({idCategory}, newCategory, {new: true});
         //JSON Update
         res.json({
             ok:true,
             category: categoryUpdate
         })
         
     } catch (error) {
         //Si no pasa por try
         res.status(500).json({
             ok:false,
             msg: 'Hable con el administrador'
         })
     }
    
 }

//Eliminar categoria
const deleteCategory = async(req, res = response) =>{
    const {idCategory} = req.params;
    try {
        const category = await Category.findOneAndDelete({idCategory});
        if( !category){
            return res.status(404).json({
                ok: false,
                msg: 'La categoría no existe'
            })
        }
        res.json({
             ok:true,
             msg: 'Categoría eliminada'
         });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}