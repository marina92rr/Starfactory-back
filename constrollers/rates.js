
const  { response} = require('express');
const Rate = require('../models/rates/Rate');


//CATEGORY

//obtener categorias
const getRates = async( req, res= response) =>{
    const rates = await Rate.find();
    res.json({
        ok: true,
        rates
    })
}

//Crear Categorias
const createRate =async( req, res = response) =>{
    try {
        const rate = new Rate(req.body);
        await rate.save();
        res.status(200).json({
            ok:true,
            msg: 'Tarifa creada con éxito',
            rate
        })  
    } catch (error) {
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador',
            error: error.message
        })  
    }
}

//Actualizar tarifa
const updateRate = async(req, res = response) =>{
     const {idRate} = req.params;
     try {
         const rate = await Rate.findOne({idRate});
         if(!rate){
             //Si no existe el rate
             return res.status(404).json({
                 ok:false,
                 msg: 'Tarifa no existe'
             })
         }
         const newRate ={...req.body}
            //Actualiza la categoria
         const rateUpdate = await Rate.findOneAndUpdate({idRate}, newRate, {new: true});
         //JSON Update
         res.json({
             ok:true,
             rate: rateUpdate
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
 const deleteRate = async(req, res = response) =>{
     const {idRate} = req.params;
     try {
         const rate = await Rate.findOneAndDelete({idRate});
         if( !rate){
             return res.status(404).json({
                 ok: false,
                 msg: 'La Tarifa no existe'
             })
         }
         res.json({
              ok:true,
              msg: 'Tarifa eliminada'
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
    getRates,
    createRate,
    updateRate,
    deleteRate
}