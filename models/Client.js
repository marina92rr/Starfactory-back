
const {Schema, model} = require('mongoose');

const ClientSchema = Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    mainPhone: {
        type: String,
        required: true
    },
    optionalPhone: {
        type: String,
    },
    isTeacher: {
        type: Boolean,
        required: false
    },
    
})

module.exports = model('Client', ClientSchema);