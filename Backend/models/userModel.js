const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    accessCode:{
        type:String,
        required:true
    },
    
},{timestamps:true})
module.exports = mongoose.model("User",userSchema)