
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const ProductCategorySchema = Schema({

    description: {
        type : String,
        require: true
    },

    idCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    idProduct: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
   }

});

ProductCategorySchema.plugin(AutoIncrement, {
    inc_field: 'idProductCategory',
    conllection: 'countsProductCategoryId'
});

module.exports = model('ProductCategory', ProductCategorySchema)
