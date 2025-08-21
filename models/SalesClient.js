
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const SalesClientSchema = Schema({

    idSalesClient: {
        type: Number,
        default: null
    },

    idClient: {
        type: Number,
        required: true
    },
    sales:[{
        type: Schema.Types.ObjectId,        //_id del Product
        ref: 'ProductClient',  
    }]
});

// Le indicamos que genere un campo numérico llamado 'idClient'
SalesClientSchema.plugin(AutoIncrement, {
    inc_field: 'idSalesClient',
    collection: 'countsSalesClienttId'
});

// Validación extra para asegurar que no existan ambos a la vez
SalesClientSchema.pre('validate', function (next) {
  if (this.idClient === null) {
    return next(new Error('No se puede registrar una venta sin id de cliente'));
  }
  next();
});


module.exports = model('SalesClient', SalesClientSchema);
