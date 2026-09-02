const User = require('../models/userModel.js');
const Auth = require('../models/authModel.js'); // Brought in the new Auth model
const { generateToken } = require('../lib/utils.js');
const jwt = require('jsonwebtoken');
const validator = require("validator");
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
exports.checkAuth = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('phoneNumber name age');

        if (!user) return res.status(401).json({ authenticated: false });

        res.status(200).json({
            authenticated: true,
            userId: user._id,
            phoneNumber: user.phoneNumber
        });
    } catch {
        res.status(401).json({ authenticated: false });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const token = req.cookies.jwt;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        let user = null;

        // 1. Try finding by active JWT session cookie
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.userId);
            } catch (err) {
                // Token invalid/expired; fall through to phoneNumber query
            }
        }

        // 2. Fallback: Query by phone number if JWT wasn't found/valid
        if (!user && phoneNumber) {
            user = await User.findOne({ phoneNumber });
        }

        if (!user || !user.password) {
            return res.status(400).json({ message: "Account or password not found. Please complete profile setup." });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password. Please try again." });
        }

        // 4. Re-issue JWT cookie session
        generateToken(res, user._id);

        return res.status(200).json({
            success: true,
            isNewUser: !user.name || !user.age,
            message: "Login successful",
            userId: user._id
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.sendOTP = async (req, res) => {
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

        // 1. Correct Nodemailer configuration
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com", // Changed from 'service' to 'host'
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Must be a 16-character Google App Password
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        const mailOptions = {
            from: `"Parchi Check-In" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: 'Your Parchi Login OTP',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; color: #172554;">
                    <h2>Parchi Authentication</h2>
                    <p>Your one-time password for login is:</p>
                    <h1 style="letter-spacing: 5px; color: #1e3a8a;">${otp}</h1>
                    <p>This code is valid for 10 minutes.</p>
                </div>
            `
        };

        // 2. Wrap sendMail to clearly identify SMTP failures
        try {
            await transport.sendMail(mailOptions);
            console.log(`OTP EMAILED to ${targetEmail}`);
        } catch (mailError) {
            console.error("Nodemailer Transport Error:", mailError);
            return res.status(500).json({ 
                message: "Email service failed. Check EMAIL_USER and EMAIL_PASS configuration." 
            });
        }

        const userProfile = await User.findOne({ phoneNumber });

        return res.status(200).json({
            success: true,
            isNewUser: !userProfile || !userProfile.name,
            message: "OTP sent successfully",
            email: targetEmail
        });

    } catch (error) {
        console.error("OTP Generation Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

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

exports.getUserHospital = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.hospitalId) {
            return res.status(404).json({ message: "User or hospital not found" });
        }

        const Hospital = require('../models/hospitalModel.js');
        const hospital = await Hospital.findOne({
            $or: [
                { hospitalId: user.hospitalId },
                { hipId: user.hospitalId },
                { counterId: user.hospitalId }
            ]
        });

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found in database" });
        }

        return res.status(200).json({
            success: true,
            hospital: {
                name: hospital.name,
                hospitalId: hospital.hospitalId,
                address: hospital.address
            }
        });

    } catch (error) {
        console.error("Get User Hospital Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateUserHospital = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const { hospitalId } = req.body;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { hospitalId: hospitalId },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const Hospital = require('../models/hospitalModel.js');
        const hospital = await Hospital.findOne({
            $or: [
                { hospitalId: hospitalId },
                { hipId: hospitalId },
                { counterId: hospitalId }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            user: {
                _id: user._id,
                phoneNumber: user.phoneNumber,
                hospitalId: user.hospitalId
            },
            hospital: hospital ? {
                name: hospital.name,
                address: hospital.address
            } : null
        });

    } catch (error) {
        console.error("Update User Hospital Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};