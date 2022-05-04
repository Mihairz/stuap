const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/catalog', catalogController.isLoggedIn, catalogController.view);
router.post('/catalog', catalogController.isLoggedIn, catalogController.find);

router.get('/catalog-add', catalogController.isLoggedIn, catalogController.form);
router.post('/catalog-add', catalogController.isLoggedIn, catalogController.create);

router.get('/catalog-edit/:catalog', catalogController.isLoggedIn, catalogController.edit);
router.post('/catalog-edit/:catalog', catalogController.isLoggedIn, catalogController.update);

router.get('/catalog-view/:table', catalogController.isLoggedIn, catalogController.viewuser);

router.get('/catalog-delete/:catalog', catalogController.isLoggedIn, catalogController.delete);

module.exports = router;