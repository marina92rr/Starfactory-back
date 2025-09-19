const {Router} = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { CreateUser, LoginUser, revalidateToken, getUsers, updateUser, deleteUser } = require('../constrollers/auth');
const { validateJWT } = require('../middlewares/validate-jwt');



//---------RUTAS-----------
const router = Router();


//Registro
router.post('/register',
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'La constraseña debe ser mayor de 5').isLength({min:5}),
    ],
    CreateUser
)

//Login
router.post('/login',
    [
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        validateFields

    ],
    LoginUser
),

//getUser
router.get('/users', validateJWT, getUsers);

//updateUser
router.put('/:idUser', validateJWT, updateUser);

//deleteUser
router.delete('/:idUser', validateJWT, deleteUser);


//Renovar token
router.get('/renew', validateJWT, revalidateToken);



module.exports = router;    //Exportar rutas