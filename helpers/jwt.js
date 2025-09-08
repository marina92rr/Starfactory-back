
const jwt = require('jsonwebtoken');



const generateJWT = (uid, name) =>{

    return new Promise( (resolve, reject) => {

        const payload = { uid, name };

        //Firma del Token que tiene payload, la palabra secreta de .env y opciones{ que expire el token en 2 horas}
        jwt.sign( payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '400h'
        }, ( err, token) =>{

            if( err){
                console.log( err );
                reject(' No se pudo generar el token')
            }

            resolve( token);
        })
    })

}

module.exports = {
    generateJWT
}