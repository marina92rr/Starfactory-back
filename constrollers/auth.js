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

        if (user) {
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

        if (error?.code === 11000) {
            return res.status(400).json({ ok: false, msg: 'Email ya registrado' });
        }
        console.error('[CreateUser]', error);  // <--- para ver el motivo exacto
        return res.status(500).json({ ok: false, msg: 'Hable con el administrador' });
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
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            })
        }

        //Generar JSON WEB TOKEN JWT
        const token = await generateJWT(user.id, user.name, user.isAdmin);

        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            isAdmin: user.isAdmin,
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
    const { uid, name, isAdmin } = req;
    //Generar nuevo token JWT y retornarlo en peticion
    const token = await generateJWT(uid, name, isAdmin);

    res.json({
        ok: true,
        uid,
        name,
        isAdmin,
        token
    })
}

//Obtener todos los usuarios
const getUsers = async (req, res = response) => {

    try {
        const excludeId = [
            '3',
            '13'
        ]
          const users = await User.find({ idUser: { $nin: excludeId } });   //Todos los usuarios excepto ecludeId
    res.json({
        ok: true,
        users
    })
        
    } catch (error) {
        console.error('[getUsers]', error);
        res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
    }
  
}


//Actualizar usuario
const updateUser = async (req, res = response) => {

    const { idUser } = req.params;
  const { password, currentPassword, ...rest } = req.body;

  try {
    const user = await User.findOne({ idUser });
    if (!user) return res.status(404).json({ ok:false, msg:'Usuario no existe' });

    const update = { ...rest };

    if (password?.trim()) {
      const isAdmin = req.user?.isAdmin === true;
      const isSelf  = req.user?.idUser === idUser;

      if (!isAdmin && isSelf) {
        if (!currentPassword) return res.status(400).json({ ok:false, msg:'Falta contraseña actual' });
        const ok = await bcrypt.compare(currentPassword, user.password || '');
        if (!ok) return res.status(401).json({ ok:false, msg:'Contraseña actual incorrecta' });
      }

      update.password = await bcrypt.hash(password, 10);
    }

    const updated = await User
      .findOneAndUpdate({ idUser }, update, { new:true, runValidators:true })
      .select('-password');

    res.json({ ok:true, user: updated });
    } catch (error) {           
        console.error('[updateUser]', error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

//Eliminar usuario
const deleteUser = async (req, res = response) => {

    const {idUser} = req.params;  //Parametro
    try {
        const user = await User.findOneAndDelete({idUser});
       
        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no existe por ese id'
            });
        }
        res.json({
            ok: true,
            msg: 'Usuario eliminado'
        })
    } catch (error) {
        console.error('[deleteUser]', error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}


module.exports = {
    CreateUser,
    LoginUser,
    revalidateToken,

    getUsers,
    updateUser,
    deleteUser
}   