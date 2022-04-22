const express = require('express');
const router = express.Router();
const orarController = require('../controllers/orarController');

router.get('/orar',orarController.isLoggedIn, orarController.view);
router.post('/orar',orarController.isLoggedIn, orarController.find);

router.get('/orar-add',orarController.isLoggedIn,orarController.form);
router.post('/orar-add',orarController.isLoggedIn,orarController.create);

router.get('/orar-edit/:id',orarController.isLoggedIn,orarController.edit);
router.post('/orar-edit/:id',orarController.isLoggedIn,orarController.update);

router.get('/orar-view/:id',orarController.isLoggedIn,orarController.viewuser);

router.get('/orar-delete/:id',orarController.isLoggedIn,orarController.delete);

module.exports = router;