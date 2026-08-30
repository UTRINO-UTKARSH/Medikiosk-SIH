const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:false
    },
    age:{
        type:String,
        required:false
    },
    gender:{
        type:String,
        required:false
    },
    phoneNumber: { 
        type: String, 
        required: true, 
        unique: true,
        ref: 'Auth'  
    },
},{timestamps:true})
module.exports = mongoose.model("User",userSchema)