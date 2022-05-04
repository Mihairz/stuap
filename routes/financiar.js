const express = require('express');
const router = express.Router();
const financiarController = require('../controllers/financiarController');

router.get('/financiar', financiarController.isLoggedIn, financiarController.view);
router.post('/financiar', financiarController.isLoggedIn, financiarController.find);

router.get('/financiar-view/:table', financiarController.isLoggedIn, financiarController.viewuser);

module.exports = router;