const express = require('express');
const router = express.Router();
const adminiController = require('../controllers/adminiController');

router.get('/admini',adminiController.isLoggedIn,adminiController.view);
router.post('/admini', adminiController.isLoggedIn,adminiController.find);

router.get('/registerAdmin', adminiController.isLoggedIn,adminiController.registerAdmin);

router.get('/deleteAdmin/:email', adminiController.isLoggedIn, adminiController.deleteAdmin);

module.exports = router;