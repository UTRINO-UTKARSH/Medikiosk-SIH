const User = require('../models/userModel.js');
const { generateToken } = require('../lib/utils.js');
const jwt = require('jsonwebtoken');
const validator = require("validator")
const nodemailer = require('nodemailer')
const QRCode = require('qrcode');
const connectDb = require('../lib/db.js');
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

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        const foundUser = await User.findOne({ phoneNumber });
        if (!foundUser) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Check if OTP matches and is not expired
        if (!foundUser.otp || foundUser.otp !== otp || foundUser.otpExpires < Date.now()) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP fields so code cannot be reused
        foundUser.otp = null;
        foundUser.otpExpires = null;
        await foundUser.save();

        // Issue 6-hour JWT auth cookie
        generateToken(res, foundUser._id);

        return res.status(200).json({
            success: true,
            message: "Login successful. Session valid for 6hrs",
            userId: foundUser._id
        });

    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.sendOTP = async (req, res) => {
    await connectDb()
    try {
        const { phoneNumber } = req.body;
        const { email } = req.body
        if ( !email) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Not a valid Email!" });
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number format (must be 10 digits)" });
        }

        const foundUser = await User.findOne({ phoneNumber });
        if (!foundUser) {
            return res.status(404).json({ message: "Patient not found with this number" });
        }
        if (!foundUser.email) {
            return res.status(404).json({ message: "No patient find with this email" })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        foundUser.otp = otp;
        foundUser.otpExpires = Date.now() + 10 * 60 * 1000;
        await foundUser.save();

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        const mailOptions = {
            from: `"MediKiosk Check-In" <${process.env.EMAIL_USER}>`,
            to: foundUser.email,
            subject: 'Your MediKiosk Login OTP',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; color: #172554;">
                    <h2>MediKiosk Authentication</h2>
                    <p>Your one-time password for login is:</p>
                    <h1 style="letter-spacing: 5px; color: #1e3a8a;">${otp}</h1>
                    <p>This code is valid for 10 minutes.</p>
                </div>
            `
        };

        await transport.sendMail(mailOptions)
        console.log(`OTP EMAILED to ${foundUser.email}`);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("OTP Generation Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// exports.generateQR = async (req, res) => {
//     try {
//         const { accessCode, name, dob } = req.body;
//         if (!accessCode) {
//             return res.status(400).json({ message: "Access code required" })
//         }
//         const patientData = {
//             "Token Id": accessCode,
//             "Full Name": name || "",
//             "Date of birth": dob || ""
//         };
//         const datastring = JSON.stringify(patientData)
//         const qrcode = await QRCode.toDataURL(datastring);
//         return res.status(200).json({
//             success: true,
//             message: "QR Code generated successfully",
//             qrImage: qrCodeImageBase64
//         });
//     } catch (err) {
//         console.error("QR Generation Error:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to generate QR code"
//         });
//     }
// }