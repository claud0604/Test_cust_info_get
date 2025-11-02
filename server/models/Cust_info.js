const mongoose = require('mongoose');

const custInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    occupation: {
        type: String,
        default: '',
    },
    serviceName: {
        type: String,
        required: true,
    },
    height: {
        type: String,
        default: '',
    },
    weight: {
        type: String,
        default: '',
    },
    clothingSize: {
        type: String,
        default: '',
    },
    reason: {
        type: String,
        required: true,
    },
    stylePreference: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Cust_info', custInfoSchema);
