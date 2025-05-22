
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Client = require("./Client");


const ProductSchema = Schema({

    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        required: true
    }


});

//LabelSchema.plugin(AutoIncrement, {
// inc_field: 'idLabel',
// collection: 'countsLabelId'});

module.exports = model('Product', ProductSchema);
