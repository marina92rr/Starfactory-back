
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
        res.status(400).json({
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

//PRODUCT





module.exports = {
    getRates,
    createRate
}