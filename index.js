
const express = require('express');

require('dotenv').config();     //configurar archivo env
const cors = require('cors');
const { dbConnection } = require('./database/config');
const { request } = require('http');



//Crear servidor de Express
const app = express();

// index.js o app.js
require('dotenv').config();

app.use(cors({
  //origin: ['http://localhost:5173'],
  origin: ['https://www.starfactorysevillaadmin.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

//Base de Datos DB
(async () => {
  try {
    await dbConnection();
    // …arranca tu server solo si hay DB
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

//Escuchar peticion
app.listen( process.env.PORT, () => {
    console.log(`Servidor ejecutandose en Puerto ${process.env.PORT}`);
})

//Lectura y parsero del body
app.use( express.json());

//Directorio publico
app.use( express.static('public'));



//----------Rutas----------
//Auth Usuarios
app.use('/auth', require('./routes/auth'));

//clientes
app.use('/clients', require('./routes/clients'));
app.use('/labels', require('./routes/labels'));
app.use('/productsClient', require('./routes/productsClient'));

//Store
app.use('/category', require('./routes/category'));
app.use('/products', require('./routes/products'));

//Rates
app.use('/rates', require('./routes/rates'));
app.use('/quotas', require('./routes/quotas'));

//Sales
app.use('/productclient', require('./routes/productsClient'));

//Suscripciones quotas
app.use('/suscriptions', require('./routes/suscriptionClient'));

