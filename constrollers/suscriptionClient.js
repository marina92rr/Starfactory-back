const  { response} = require('express');
const suscriptionClient = require('../models/SuscriptionClient');
const Quota = require('../models/rates/Quota');
const Client = require('../models/Client');



//Get Product de ID Categoria
//const suscriptionByClient = async(req, res = response) =>{
//    const {idCategory} = req.params;
//
//    try {
//        const products = await Product.find({ idCategory: idCategory}).populate('idCategory')
//        
//        res.status(200).json({
//
//            products
//        })
//    } catch (error) {
//        console.log(error);
//        res.status(500).json({
//            ok:false,
//            msg: 'Fallo al obtener productos por categoria'
//        })
//        
//    }
//}