
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const UserSchema = Schema({

    user: {
        type: String,
        required: true
    },
    pass:{
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    }

});


UserSchema.plugin(AutoIncrement, {
    inc_field: 'idUser',
    Collection: 'countsUserId'});

module.exports = model('User', UserSchema);

