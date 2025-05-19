
const express = require('express');
require('dotenv').config();     //configurar archivo env
const cors = require('cors');
const {dbConnection} = require('./database/config')

//Crear servidor de Express
const app = express();

//Base de Datos DB
dbConnection();

//desbloquear conexion
app.use(cors());

//Escuchar peticion
app.listen( process.env.PORT, () => {
    console.log(`Servidor ejecutandose en Puerto ${process.env.PORT}`);
})


//Directorio publico
app.use( express.static('public'));

//Lectura y parsero del body
app.use( express.json());

//Rutas
app.use('/api/clients', require('./routes/clients'));