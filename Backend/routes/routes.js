const express = require("express")
const router = express.Router()
const {checkAuth, sendOTP,verifyOTP,login,signup,getUserHospital,updateUserHospital } = require('../controller/userController.js');
const {Profile} = require('../controller/CounterControl.js')
const {getHospitalDetails,getAllHospitals,getDefaultHospital, generateQR,addHospital} = require('../controller/hospitalController.js')
router.post('/verify-otp', verifyOTP);
router.post('/add', addHospital);
router.get('/check-auth', checkAuth);
router.post('/send-otp', sendOTP);
router.put('/profile',Profile)
router.get('/:id', getHospitalDetails);
router.post('/generate-qr', generateQR);
router.get('/hospitals', getAllHospitals)
router.get('/hospital', getUserHospital)
router.put('/hospital', updateUserHospital)
router.post('/login', login);
module.exports = router;