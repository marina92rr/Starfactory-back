
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const UserSchema = Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },

    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }

});


UserSchema.plugin(AutoIncrement, {
    inc_field: 'idUser',
    Collection: 'countsUserId'});

module.exports = model('User', UserSchema);

