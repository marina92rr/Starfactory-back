
const express = require('express');

require('dotenv').config();     //configurar archivo env
const cors = require('cors');
const {dbConnection} = require('./database/config');
const { request } = require('http');



//Crear servidor de Express
const app = express();

app.use(cors({
  //origin: ['http://localhost:5173'],
  origin: ['https://www.starfactorysevillaadmin.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

//Base de Datos DB
dbConnection();

//Escuchar peticion
app.listen( process.env.PORT, () => {
    console.log(`Servidor ejecutandose en Puerto ${process.env.PORT}`);
})

//Directorio publico
app.use( express.static('public'));

//Lectura y parsero del body
app.use( express.json());

//Ruta
app.use('/clients', require('./routes/clients'));
app.use('/labels', require('./routes/labels'));
app.use('/products', require('./routes/products'));
app.use('/productsClient', require('./routes/productsClient'));
app.use('/store', require('./routes/store'));
