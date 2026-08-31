const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
exports.Profile = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Please log in or verify OTP first." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, age, gender, password } = req.body;

        if (!name || !age || !gender || !password) {
            return res.status(400).json({ message: "Name, age, gender, and password are required" });
        } 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 
        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            {
                name,
                age: Number(age),
                gender,
                password: hashedPassword
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile setup completed successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                age: updatedUser.age,
                gender: updatedUser.gender
            }
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};