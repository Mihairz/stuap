const express = require('express');
const router = express.Router();
const orarController = require('../controllers/orarController');

router.get('/orar',orarController.isLoggedIn, orarController.view);
router.post('/orar',orarController.isLoggedIn, orarController.find);

router.get('/orar-add',orarController.isLoggedIn,orarController.form);
router.post('/orar-add',orarController.isLoggedIn,orarController.create);

router.get('/orar-edit/:grupa/:id',orarController.isLoggedIn,orarController.edit);
router.post('/orar-edit/:grupa/:id',orarController.isLoggedIn,orarController.update);

router.get('/orar-view/:grupa',orarController.isLoggedIn,orarController.viewuser);

router.get('/orar-delete/:grupa/:id',orarController.isLoggedIn,orarController.delete);

module.exports = router;