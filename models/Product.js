
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const ProductSchema = Schema({

    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    }
});

ProductSchema.plugin(AutoIncrement, {
 inc_field: 'idProduct',
 collection: 'countsProductId'});

module.exports = model('Product', ProductSchema);
