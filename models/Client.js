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
        required: false,
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
   dateCancellation: {
        type: Date,
    },
    dateRegistration: {
        type: Date,
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
    }],
    
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

// Comprueba si el cliente está activo
function isActive(dateCancellation) {
  return dateCancellation === null;
}

// Comprueba si el cliente está de baja (fecha de cancelación pasada o igual a hoy)
function isCancelled(dateCancellation) {
  if (!dateCancellation) return false;
  const today = new Date().setHours(0,0,0,0);
  const cancelDate = new Date(dateCancellation).setHours(0,0,0,0);
  return cancelDate <= today;
}

// Comprueba si la baja está programada (fecha de cancelación en el futuro)
function isScheduledCancellation(dateCancellation) {
  if (!dateCancellation) return false;
  const today = new Date().setHours(0,0,0,0);
  const cancelDate = new Date(dateCancellation).setHours(0,0,0,0);
  return cancelDate > today;
}

module.exports = model('Client', ClientSchema);