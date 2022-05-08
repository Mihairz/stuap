const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/profile', profileController.isLoggedIn, profileController.view);

router.get('/profileEdit/:email', profileController.isLoggedIn, profileController.edit);
router.post('/profileEdit/:email', profileController.isLoggedIn, profileController.update);

router.get('/profileVisit/:email',profileController.isLoggedIn,profileController.visit);

module.exports = router;