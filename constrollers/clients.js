const {response} = require('express');
const Client = require('../models/Client');

const getClients = async(req, res = response) =>{

    const clients = await Client.find();
    
    res.json({
        ok:true,
        clients
    })
}

const createClient = async(req, res = response)  =>{
    try {
        const client = new Client(req.body);    //Crear nuevo objeto cliente
        await client.save();   
       res.status(201).json({
        ok:true,
        msg: 'Cliente creado', client,
    }) 

    } catch (error) {
        res.status(500).json({
            ok:false,
            msg: 'Hable con el administrador',
            error:error.message
        })
    }
}

const updateClient = (req, res = response) =>{
    res.json({
        ok:true,
        msg: 'Actualizar Cliente'
    })
}

const deleteClient = async(req, res = response) =>{

    const clientId = req.params.id;

    try {
        const client = await Client.findById(clientId);
        if( !client ){
            return res.status(404).json({
                ok: false,
                msg: ' El cliente no existe'
            })
        }

        await Client.findByIdAndDelete(clientId);
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
    getClients,
    createClient,
    updateClient,
    deleteClient
}