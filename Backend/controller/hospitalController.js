// controllers/hospitalController.js
const Hospital = require('../models/hospitalModel');
const QRCode = require('qrcode');
const connectDb = require('../lib/db.js'); // <-- Added missing import

exports.addHospital = async (req, res) => {
    try {
        await connectDb(); // Good practice to ensure DB is connected
        const newHospital = new Hospital(req.body);
        await newHospital.save();
        
        return res.status(201).json({ 
            success: true,
            message: "Hospital added to database successfully!", 
            hospital: newHospital 
        });
    } catch (err) {
        console.error("Add Hospital Error:", err);
        return res.status(500).json({ message: err.message });
    }
};

exports.generateQR = async (req, res) => {
    try {
        const { hospitalId } = req.body;
        
        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID required" });
        }
        const qrcodeBase64 = await QRCode.toDataURL(hospitalId);

        return res.status(200).json({
            success: true,
            message: "Hospital QR Code generated successfully",
            qrImage: qrcodeBase64
        });

    } catch (err) {
        console.error("QR Generation Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to generate QR code"
        });
    }
};

exports.getDefaultHospital = async (req, res) => {
    try {
        await connectDb();
        
        // Find the first available hospital in your Atlas collection
        const hospital = await Hospital.findOne({});

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found in database" });
        }

        return res.status(200).json({ 
            success: true,
            hospital 
        });
    } catch (err) {
        console.error("Default Hospital Fetch Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Kept the correct version of getHospitalDetails
exports.getHospitalDetails = async (req, res) => {
    try {
        await connectDb();
        const { id } = req.params;

        // Query across all ID field variations present in your database
        const hospital = await Hospital.findOne({
            $or: [
                { hospitalId: id },
                { hipId: id },
                { counterId: id }
            ]
        });

        if (!hospital) {
            return res.status(404).json({ message: `Hospital with ID ${id} not found` });
        }

        return res.status(200).json({ 
            success: true,
            hospital 
        });
    } catch (err) {
        console.error("Fetch Hospital Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Added this to prevent crashes since it is imported in your routes.js
exports.getAllHospitals = async (req, res) => {
    try {
        await connectDb();
        const hospitals = await Hospital.find({});
        return res.status(200).json({ success: true, count: hospitals.length, hospitals });
    } catch (err) {
        console.error("Get All Hospitals Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};