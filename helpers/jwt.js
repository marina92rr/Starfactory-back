
const jwt = require('jsonwebtoken');


const generateJWT = (uid, name, isAdmin, email) => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name, isAdmin, email };
    const secret = process.env.SECRET_JWT_SEED;

    if (!secret) {
      return reject(new Error('SECRET_JWT_SEED no está definida'));
    }

    jwt.sign(payload, secret, /* opciones */ {}, (err, token) => {
      if (err) {
        console.error('[generateJWT] Error al firmar:', err.message);
        return reject(err);
      }
      resolve(token);
    });
  });
};

module.exports = {
    generateJWT
}