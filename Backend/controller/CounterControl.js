const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
// exports.generateCode = async (req, res) => {
//     try {
//         const { name, dob } = req.body
//         if (!name || !dob) {
//             return res.status(400).json({ message: "Name and DOB is required" })
//         }
//         const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
//         let newCode = '';
//         for (let i = 0; i <9; i++) {
//             newCode += chars.charAt(Math.floor(Math.random() * chars.length))
//         }
//         const formattedCode = `${newCode.slice(0, 3)}-${newCode.slice(3, 6)}-${newCode.slice(6)}`
//         const newPatient = await User.create({
//             name,
//             dob,
//             accessCode: newCode
//         });
//         return res.status(201).json({
//             message: "Patient created successfully",
//             patientId: newPatient._id,
//             name: newPatient.name,
//             displayCode: formattedCode
//         });
//     }
//     catch(error){
//         console.error("Error generating code:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

exports.Profile = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Session expired." });
        } 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
         
        const { name, age, dob, gender, bloodGroup } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        } 
        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { name, age, dob, gender, bloodGroup },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User profile not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};