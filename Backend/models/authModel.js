// models/authModel.js
const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    phoneNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String 
    },
    otp: { 
        type: String,
        default: null
    },
    otpExpires: { 
        type: Date,
        default: null
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Auth', authSchema);