const { response } = require("express");
const res = require("express/lib/response");
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
    try {
        const quota = new Quota(req.body);
        await quota.save();
        res.status(400).json({
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
const updateQuota = async(req,res = response) =>{

    const {idQuota} = req.params;
    try {
        const quota = await Quota.findById(idQuota);
        if(!quota){
            return res.status(404).json({
                ok:false,
                msg: 'La cuota no existe'
            })
        }

        const newQuota = { ...req.body}
        const quotaUpdate = await Quota.findByIdAndUpdate({idQuota}, newQuota, {new:true});

        req.json({
            ok:true,
            quota: quotaUpdate
        })

    } catch (error) {
         res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }
}

//Eliminar cuota
const deleteQuota= async(req, res = response) =>{
    const {idQuota} = req.params;
    try {
        const quota = await Quota.findOneAndDelete({idQuota});
        if( !quota){
            return res.status(404).json({
                ok: false,
                msg: 'La cuota no existe'
            })
        }

         res.json({
            ok:true,
            msg: 'Cuota eliminada'
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
