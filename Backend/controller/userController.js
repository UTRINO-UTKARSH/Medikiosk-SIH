const User = require('../models/userModel.js');
const { generateToken } = require('../lib/utils.js');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode')
exports.checkAuth = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ authenticated: true, userId: decoded.userId });
    } catch {
        res.status(401).json({ authenticated: false });
    }
}

exports.loginWithCode = async (req, res) => {
    try {
        let { accessCode } = req.body
        if (!accessCode) {
            return res.status(400).json({ message: "Access code is required" });
        }

        accessCode = accessCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        if (accessCode.length !== 9) {
            return res.status(400).json({ message: "Invalid code format" });
        }

        const foundUser = await User.findOne({ accessCode: accessCode });

        if (!foundUser) {
            return res.status(401).json({ message: "Invalid or expired access code" });
        }

        generateToken(res, foundUser._id);

        await User.updateOne(
            { _id: foundUser._id },
            { $set: { accessCode: "" } }
        );

        return res.status(200).json({
            message: "Login successful. Session valid for 40 minutes.",
            userId: foundUser._id
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
exports.generateQR = async (req, res) => {
    try {
        const { accessCode, name, dob } = req.body;
        if (!accessCode) {
            return res.status(400).json({ message: "Access code required" })
        }
        const patientData = {
            "Token Id": accessCode,
            "Full Name": name || "",
            "Date of birth": dob || ""
        };
        const datastring = JSON.stringify(patientData)
        const qrcode = await QRCode.toDataURL(datastring);
        return res.status(200).json({
            success: true,
            message: "QR Code generated successfully",
            qrImage: qrCodeImageBase64
        });
    } catch (err) {
        console.error("QR Generation Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to generate QR code"
        });
    }
}