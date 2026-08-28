const jwt = require('jsonwebtoken');

exports.generateToken =   (res,userId)=>{
    try {
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"60m"});
        res.cookie("jwt",token,{
            maxAge: 60 * 60 * 1000,
            httpOnly: true,   
            sameSite: "lax",   
            secure: process.env.NODE_ENV !== "development"  
        })

        return token
    } catch (error) {
        console.log(error)
    }
}