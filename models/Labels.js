
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Client = require("./Client");


const LabelSchema = Schema({

    name: {
        type: String,
        require: true
    },
    color: {
        type: String,
        require: true
    }

});

//LabelSchema.plugin(AutoIncrement, {
// inc_field: 'idLabel',
// collection: 'countsLabelId'});

module.exports = model('Label', LabelSchema);
