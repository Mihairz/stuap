const express = require('express');
const router = express.Router();
const orarController = require('../controllers/orarController');

router.get('/orar', orarController.view);
router.post('/orar', orarController.find);

router.get('/orar-add',orarController.form);
router.post('/orar-add',orarController.create);

router.get('/orar-edit/:id',orarController.edit);
router.post('/orar-edit/:id',orarController.update);

router.get('/orar-view/:id',orarController.viewuser);

router.get('/orar-delete/:id',orarController.delete);

module.exports = router;