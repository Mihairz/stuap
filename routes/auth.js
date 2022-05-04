const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register);

router.post('/registerAdmin/:email', authController.registerAdmin);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;