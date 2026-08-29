const User = require("../models/userModel")

exports.generateCode = async (req, res) => {
    try {
        const { name, dob } = req.body
        if (!name || !dob) {
            return res.status(400).json({ message: "Name and DOB is required" })
        }
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let newCode = '';
        for (let i = 0; i <9; i++) {
            newCode += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        const formattedCode = `${newCode.slice(0, 3)}-${newCode.slice(3, 6)}-${newCode.slice(6)}`
        const newPatient = await User.create({
            name,
            dob,
            accessCode: newCode
        });
        return res.status(201).json({
            message: "Patient created successfully",
            patientId: newPatient._id,
            name: newPatient.name,
            displayCode: formattedCode
        });
    }
    catch(error){
        console.error("Error generating code:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}