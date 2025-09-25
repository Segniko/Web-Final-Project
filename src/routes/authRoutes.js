const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/login', authController.loginController);
router.post('/signup', authController.signupController);
router.post('/logout', authController.logoutController);

module.exports = router;