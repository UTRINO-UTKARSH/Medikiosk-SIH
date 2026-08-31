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
    password:{
        type:String,
        required:false
    },
    hospitalId:{
        type:String,
        required:false,
        ref:'Hospital'
    }
},{timestamps:true})
module.exports = mongoose.model("User",userSchema)