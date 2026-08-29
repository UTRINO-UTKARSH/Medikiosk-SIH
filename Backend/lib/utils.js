const jwt = require('jsonwebtoken');

exports.generateToken =   (res,userId)=>{
    try {
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"6h"});
        res.cookie("jwt",token,{
            maxAge: 6 * 60 * 60 * 1000,
            httpOnly: true,   
            sameSite: "lax",   
            secure: process.env.NODE_ENV !== "development"  
        })

        return token
    } catch (error) {
        console.log(error)
    }
}