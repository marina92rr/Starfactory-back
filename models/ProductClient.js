


const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const ProductClientSchema = Schema({

    idClient: {
        type: Number,
        default: null
    },
    idProduct: {
        type: Number,
        default: null
    },
    idQuota: {
        type: Number,
        default: null
        
    },
    name: {
        type: String,
        required: true
    },

    idSalesClient: {
        type: Number,
        required: false
    },

    buyDate: { type: Date, required: false },
    paymentDate: { type: Date, required: false},

    price: {type: Number, required: true},
    discount: { type: Number, default:0 },

    paymentMethod: {
        type: String,
        enum: ['efectivo', 'tarjeta'],
        default: 'efectivo',
    },
    paid: {
        type: Boolean,
        required: false,
        default: false
    },


});

// Le indicamos que genere un campo numérico llamado 'idClient'
ProductClientSchema.plugin(AutoIncrement, {
    inc_field: 'idProductClient',
    collection: 'countsProductClienttId'
});

// Validación extra para asegurar que no existan ambos a la vez
ProductClientSchema.pre('validate', function (next) {
  if (this.idProduct != null && this.idQuota != null) {
    return next(new Error('Solo se puede registrar un producto o una cuota, no ambos.'));
  }
  next();
});


module.exports = model('ProductClient', ProductClientSchema);
