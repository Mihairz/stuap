const express = require('express');
const router = express.Router();
const grupaController = require('../controllers/grupaController');


router.get('/grupa/:grupa',grupaController.isLoggedIn ,grupaController.view);
router.post('/grupa/:grupa',grupaController.isLoggedIn, grupaController.find);

router.get('/grupa/:grupa/student-add',grupaController.isLoggedIn,grupaController.form);
router.post('/grupa/:grupa/student-add',grupaController.isLoggedIn,grupaController.create);

router.get('/grupa/:grupa/student-edit/:id',grupaController.isLoggedIn,grupaController.edit);
router.post('/grupa/:grupa/student-edit/:id',grupaController.isLoggedIn,grupaController.update);

router.get('/grupa/:grupa/student-view/:id',grupaController.isLoggedIn,grupaController.viewuser);

router.get('/grupa/:grupa/student-delete/:email',grupaController.isLoggedIn,grupaController.delete); 

module.exports = router;