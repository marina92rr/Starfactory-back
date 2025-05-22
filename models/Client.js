const mongoose = require('mongoose')
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ClientSchema = Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    mainPhone: {
        type: String,
        required: true
    },
    optionalPhone: {
        type: String,
    },
    isTeacher: {
        type: Boolean,
        required: false
    },

     //id User
    idUser: {
        type: Schema.Types.ObjectId,        //_id del User
        ref: 'User',                      //Nombre modelo al que va unido
        require: true
    },
     //id Productos
    idProducts: {
        type: Schema.Types.ObjectId,        //_id del Product
        ref: 'Product',                      //Nombre modelo al que va unido
        require: true
    },
     //Unión con id Etiquetas
    idLabels: {
        type: Schema.Types.ObjectId,        //_id del Label
        ref: 'Label',                      //Nombre modelo al que va unido
        require: true
    },
    
})

// Le indicamos que genere un campo numérico llamado 'idClient'
ClientSchema.plugin(AutoIncrement, {
  inc_field: 'idClient',
  collection: 'countsClientId' });

module.exports = model('Client', ClientSchema);