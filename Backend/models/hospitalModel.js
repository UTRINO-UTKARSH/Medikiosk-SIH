const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    hospitalId: { 
        type: String, 
        required: true, 
        unique: true  
    }, 
    name: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String,
        required: true
    },
    counterId: { 
        type: String,
        required: true
    },
    hipId: { 
        type: String,
        required: true
    }
}, { timestamps: true,collection: 'hospitals' });
module.exports = mongoose.model('Hospital', hospitalSchema);