
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const CategorySchema = Schema({

    name: {
        type : String,
        require: true
    },

});

CategorySchema.plugin(AutoIncrement, {
    inc_field: 'idCategory',
    conllection: 'countsCategoryId'
});

module.exports = model('Category', CategorySchema)
