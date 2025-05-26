


const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const ProductClientSchema = Schema({

   idProduct: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
   },

   idClient :{
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
   },

    paid: {
        type: Boolean,
    },

    dateValue: {
        type: Date,
        require: true
    },

     paymentDate: {
        type: Date,
        require: true
    },
    paymentMethod: {
        type: String,
        
    }


});

// Le indicamos que genere un campo numérico llamado 'idClient'
ProductClientSchema.plugin(AutoIncrement, {
  inc_field: 'idProductClient',
  collection: 'countsProductClienttId' 
});


module.exports = model('ProductClient', ProductClientSchema);
