
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
        require: true
    },
      //id Category
      idCategory: {
        type: Schema.Types.ObjectId,        //_id del User
        ref: 'Category',                      //Nombre modelo al que va unido
        require: true
    },
});



ProductSchema.plugin(AutoIncrement, {
 inc_field: 'idProduct',
 collection: 'countsProductId'});

module.exports = model('Product', ProductSchema);
