const express = require('express');
const router = express.Router();
const grupaController = require('../controllers/grupaController');

router.get('/grupa/:grupa', grupaController.view);
router.post('/grupa/:grupa', grupaController.find);

router.get('/grupa/:grupa/student-add',grupaController.form);
router.post('/grupa/:grupa/student-add',grupaController.create);

router.get('/grupa/:grupa/student-edit/:id',grupaController.edit);
router.post('/grupa/:grupa/student-edit/:id',grupaController.update);

router.get('/grupa/:grupa/student-view/:id',grupaController.viewuser);

router.get('/grupa/:grupa/student-delete/:id',grupaController.delete); 

module.exports = router;