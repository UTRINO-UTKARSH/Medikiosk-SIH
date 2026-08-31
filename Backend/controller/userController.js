const User = require('../models/userModel.js');
const Auth = require('../models/authModel.js'); // Brought in the new Auth model
const { generateToken } = require('../lib/utils.js');
const jwt = require('jsonwebtoken');
const validator = require("validator");
const nodemailer = require('nodemailer');
const connectDb = require('../lib/db.js');
// const QRCode = require('qrcode'); // Uncomment if needed later
 
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
 
exports.sendOTP = async (req, res) => {
    await connectDb();
    try {
        const { phoneNumber, email } = req.body;

        const phoneRegex = /^\d{10}$/;
        if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Valid 10-digit phone number is required" });
        }

        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ message: "Not a valid Email!" });
        }
 
        let authAccount = await Auth.findOne({ phoneNumber });
        let targetEmail = "";

        if (authAccount) { 
            if (!authAccount.email) {
                return res.status(400).json({ message: "Account error: No email registered. Please register." });
            }
            targetEmail = authAccount.email;
        } else { 
            if (!email) {
                return res.status(202).json({ 
                    isNewUser: true, 
                    requireEmail: true,
                    message: "New patient detected. Please provide an email address." 
                });
            }
            targetEmail = email;  
            authAccount = new Auth({ 
                phoneNumber: phoneNumber, 
                email: email 
            });
        }
 
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        authAccount.otp = otp;
        authAccount.otpExpires = Date.now() + 10 * 60 * 1000;
        await authAccount.save();

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"MediKiosk Check-In" <${process.env.EMAIL_USER}>`,
            to: targetEmail, 
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

        await transport.sendMail(mailOptions);
        console.log(`OTP EMAILED to ${targetEmail}`);
 
        const userProfile = await User.findOne({ phoneNumber });

        return res.status(200).json({
            success: true,
            isNewUser: !userProfile || !userProfile.name,   
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("OTP Generation Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
 
exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }
 
        const authAccount = await Auth.findOne({ phoneNumber });
        if (!authAccount) {
            return res.status(404).json({ message: "Authentication record not found" });
        }

        if (!authAccount.otp || authAccount.otp !== otp || authAccount.otpExpires < Date.now()) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }
 
        authAccount.otp = null;
        authAccount.otpExpires = null;
        await authAccount.save(); 
 
        let foundUser = await User.findOne({ phoneNumber });
        let isNewUser = false;

        if (!foundUser) { 
            foundUser = new User({ phoneNumber });
            await foundUser.save();
            isNewUser = true;
        } else {
            isNewUser = !foundUser.name || !foundUser.age;
        }
         
        generateToken(res, foundUser._id);

        return res.status(200).json({
            success: true,
            isNewUser: isNewUser,
            message: "Login successful. Session valid for 6hrs",
            userId: foundUser._id
        });

    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

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