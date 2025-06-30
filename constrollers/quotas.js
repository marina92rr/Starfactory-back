const { response } = require("express");
const Quota = require("../models/rates/Quota");


//getquota
const getQuotas = async( req, res = response) =>{
    const quotas = await Quota.find();
    res.json({
        ok:true,
        quotas
    })
};

//cuotas por id cliente

//crear cuota
const createQuota = async( req, res = response) =>{
    console.log('Datos recibidos en backend:', req.body);

    try {
        const quota = new Quota(req.body);


        await quota.save();
        res.status(200).json({
            ok:true,
            msg: 'Cuota creada con éxito', 
            quota
        })
        
    } catch (error) {
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador',
            error: error.message
        })
    }
}
//Editar Cuota
const updateQuota = async(req, res = response) =>{

    const {idQuota} = req.params;
    try {
        // Buscamos por el campo 'idQuota', no por el '_id' de MongoDB
        const quota = await Quota.findOne({idQuota});
        if(!quota){
            return res.status(404).json({
                ok:false,
                msg: 'La cuota no existe'
            })
        }
        const newQuota = { ...req.body}
        // Usamos findOneAndUpdate para buscar por un campo que no es el _id
        const quotaUpdate = await Quota.findOneAndUpdate({idQuota}, newQuota, {new: true});

        res.json({ // Corregido de req.json a res.json
            ok:true,
            quota: quotaUpdate
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Error al actualizar la cuota'
        })
    }
}

//Eliminar cuota
const deleteQuota= async(req, res = response) =>{
    const {idQuota} = req.params;
    try {
        const quota = await Quota.findOneAndDelete({idQuota});
       
         res.json({
            ok:true,
            msg: 'Cuota eliminada',
            quota
        });

    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}


//Get cuota de ID Tarifa
const quotaByIdRate = async(req, res = response) =>{
    const {idRate} = req.params;

    try {
        const quotas = await Quota.find({ idRate: idRate}).populate('idRate')
        
        res.status(200).json({
            quotas
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
   getQuotas,
   createQuota,
   updateQuota,
   deleteQuota,
   quotaByIdRate
}
