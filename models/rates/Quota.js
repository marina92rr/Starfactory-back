
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const QuotaSchema = Schema({

    name: {
        type: String,
        required: true
    },
    description:{
        type:String,
        required: false
    },
    numSession: {
        type: Number,
        required: false, // o false, según tu lógica
    },
    numPeriods: {
        type: Number,
        required: false, // o false, según tu lógica

    },
    period:{
        type: String,
        required: false, // o false, según tu lógica

    },
    price: {
        type: Number,
        required: true
    },
      //id Category
    idRate: {
        type: Schema.Types.ObjectId,        //_id tarifa
        ref: 'Rate',                      //Nombre modelo al que va unido
        required: true
    },
});

// Habilitar que se incluya idQuota en .toJSON()
QuotaSchema.set('toJSON', { virtuals: true });

//Id incrementado
QuotaSchema.plugin(AutoIncrement, {
 inc_field: 'idQuota',
 collection: 'countsQuotaId'});

module.exports = model('Quota', QuotaSchema);
