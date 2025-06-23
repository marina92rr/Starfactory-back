
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const RateSchema = Schema({

    name: {
        type : String,
    },
    description: {
        type : String,
    },

});

RateSchema.plugin(AutoIncrement, {
    inc_field: 'idRate',
    conllection: 'countsRateId'
});

module.exports = model('Rate', RateSchema)

