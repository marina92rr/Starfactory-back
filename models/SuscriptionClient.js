

const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const SuscriptionClientSchema = Schema({

    idClient: {
        type: Number,
        required: true
    },

    idQuota: {
        type: Number,
        default: null
    },

    startDate: { type: Date, default: Date.now },

    price: { type: Number, required: true },

    paymentMethod: {
        type: String,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
        default: 'efectivo',
    },
    active: {
        type: Boolean,
        default: true,
        required: false
    },


});

// Le indicamos que genere un campo numérico llamado 'suscriptionClient'
SuscriptionClientSchema.plugin(AutoIncrement, {
    inc_field: 'idSuscriptionClient',
    collection: 'countsSuscriptionClienttId'
});




module.exports = model('SuscriptionClient', SuscriptionClientSchema);
