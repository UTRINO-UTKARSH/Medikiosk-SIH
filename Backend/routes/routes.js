const express = require("express")
const router = express.Router()
const {checkAuth, loginWithCode } = require('../controller/userController.js');
const {generateCode} = require("../controller/CounterControl.js")
router.post('/login', loginWithCode);
router.get('/check-auth', checkAuth);
router.post('/generate-code', generateCode);
module.exports = router;