const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/catalog', catalogController.view);
router.post('/catalog', catalogController.find);

router.get('/catalog-add',catalogController.form);
router.post('/catalog-add',catalogController.create);

router.get('/catalog-edit/:catalog',catalogController.edit);
router.post('/catalog-edit/:catalog',catalogController.update);

router.get('/catalog-view/:id',catalogController.viewuser);

router.get('/catalog-delete/:catalog',catalogController.delete);


module.exports = router;