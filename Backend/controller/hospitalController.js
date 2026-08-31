// controllers/hospitalController.js
const Hospital = require('../models/hospitalModel');
const QRCode = require('qrcode');

exports.getHospitalDetails = async (req, res) => {
    try {
        const { id } = req.params; // Extracts ID from /api/hospitals/:id

        const hospital = await Hospital.findOne({hospitalId:id})

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        return res.status(200).json({ hospital });
        
    } catch (err) {
        console.error("Fetch Hospital Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.addHospital = async (req, res) => {
    try {
        const newHospital = new Hospital(req.body);//get from front
        await newHospital.save();//savbe
        
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

        // IMPROVEMENT: We ONLY store the string ID in the QR code.
        // It makes the QR physically smaller, faster to scan, and much more secure.
        const qrcodeBase64 = await QRCode.toDataURL(hospitalId);

        return res.status(200).json({
            success: true,
            message: "Hospital QR Code generated successfully",
            qrImage: qrcodeBase64 // Fixed the variable mismatch bug here!
        });

    } catch (err) {
        console.error("QR Generation Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to generate QR code"
        });
    }
};