const jwt = require('jsonwebtoken');

exports.generateToken = async (res,userId)=>{
    try {
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie("jwt",token,{
            maxAge: 24 * 60 * 60,
            httpOnly: true,   
            sameSite: "lax",   
            secure: true  
        })

        return token
    } catch (error) {
        console.log(error)
    }
}