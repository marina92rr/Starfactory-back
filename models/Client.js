const mongoose = require('mongoose')
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ClientSchema = Schema({
    name: {
        type: String,
    },
    lastName: {
        type: String,
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
    },
    mainPhone: {
        type: String,
    },
    optionalPhone: {
        type: String,
    },
    isTeacher: {
        type: Boolean,
    },

     //id User
    idUser: {
        type: Schema.Types.ObjectId,        //_id del User
        ref: 'User',                      //Nombre modelo al que va unido
    },
     //id Productos ARRAY
    idProducts: [{
        type: Schema.Types.ObjectId,        //_id del Product
        ref: 'Product',                      //Nombre modelo al que va unido
    }],
     //Unión con id Etiquetas ARRAY
   idLabels: [{
    type: Number,
    }]
    
})

// Le indicamos que genere un campo numérico llamado 'idClient'
ClientSchema.plugin(AutoIncrement, {
  inc_field: 'idClient',
  collection: 'countsClientId' 
});


// Virtual para poder hacer .populate('labels')
ClientSchema.virtual('labels', {
  ref: 'Label',            // Modelo a popular
  localField: 'idLabels',  // Array de Numbers en Client
  foreignField: 'idLabel', // Campo numérico en Label
  justOne: false
});

module.exports = model('Client', ClientSchema);