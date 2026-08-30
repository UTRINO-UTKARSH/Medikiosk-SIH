const express = require("express")
const router = express.Router()
const {checkAuth, sendOTP,verifyOTP } = require('../controller/userController.js');
const {Profile} = require('../controller/CounterControl.js')
router.post('/verify-otp', verifyOTP);
router.get('/check-auth', checkAuth);
router.post('/send-otp', sendOTP);
router.put('/profile',Profile)
module.exports = router;