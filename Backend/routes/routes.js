const express = require("express")
const router = express.Router()
const {checkAuth, sendOTP,verifyOTP } = require('../controller/userController.js');
const {Profile} = require('../controller/CounterControl.js')
const {getHospitalDetails, generateQR,addHospital} = require('../controller/hospitalController.js')
router.post('/verify-otp', verifyOTP);
router.post('/add', addHospital);
router.get('/check-auth', checkAuth);
router.post('/send-otp', sendOTP);
router.put('/profile',Profile)
router.get('/:id', getHospitalDetails);
router.post('/generate-qr', generateQR);
module.exports = router;