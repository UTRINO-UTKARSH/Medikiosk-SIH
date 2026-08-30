const express = require("express")
const router = express.Router()
const {checkAuth, sendOTP,verifyOTP } = require('../controller/userController.js');
router.post('/verify-otp', verifyOTP);
router.get('/check-auth', checkAuth);
router.post('/send-otp', sendOTP);
module.exports = router;