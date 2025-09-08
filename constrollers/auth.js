const bcrypt = require('bcryptjs'); //Para encriptar la contraseña: npm i bcryptjs
const { response } = require('express');     //Para autocompletar res.json

//Models
const User = require('../models/User'); //Usuario
const { generateJWT } = require('../helpers/jwt');


//Crear Usuario
const CreateUser = async (req, res = response) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            })
        }

        user = new User(req.body);

        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);

        //Guardar User en la BBDD
        await user.save();

        //Generar token
        const token = await generateJWT(user.id, user.name);
        //Respuesta
        return res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

//Logearse
const LoginUser = async (req, res = response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        //Si el user no existe--> error
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos'
            })
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword){
            return res.status(400).json({
                ok:false,
                msg:'Contraseña incorrecta'
            })
        }

        //Generar JSON WEB TOKEN JWT
        const token = await generateJWT(user.id, user.name);

        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })

    }

}

//Revalidar token
const revalidateToken = async (req, res = response) => {
    const { uid, name } = req;
//Generar nuevo token JWT y retornarlo en peticion
const token = await generateJWT(uid, name);

    res.json({
        ok: true,
        uid,
        name,
        token
    })
}

module.exports = {
    CreateUser,
    LoginUser,
    revalidateToken
}   