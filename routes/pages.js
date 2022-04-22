const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');


router.get('/', authController.isLoggedIn, (req,res) => {
    res.render('index', {user:req.user} );
});

router.get('/index', authController.isLoggedIn, (req,res) => {
    res.render('index', {user:req.user} );
});

router.get('/register', authController.isLoggedIn, (req,res) => {
    /*if(req.user.admin){
        res.render('register');
    }else{
        res.redirect('/profile');
    }*/
    res.render('register');
});

router.get('/login', (req,res) => {
    res.render('login');
});

router.get('/profile', authController.isLoggedIn,  (req,res) => {

    if(req.user){
        res.render('profile', {user:req.user} );
    }else{
        res.redirect('/login');
    }
});

//Orar
const orarController = require('../controllers/orarController');

router.get('/orar', orarController.view);
router.post('/orar', orarController.find);

router.get('/orar-add',orarController.form);
router.post('/orar-add',orarController.create);

router.get('/orar-edit/:id',orarController.edit);
router.post('/orar-edit/:id',orarController.update);

router.get('/orar-view/:id',orarController.viewuser);

router.get('/orar-delete/:id',orarController.delete);

//Catalog
const catalogController = require('../controllers/catalogController');

router.get('/catalog', catalogController.view);
router.post('/catalog', catalogController.find);

router.get('/catalog-add',catalogController.form);
router.post('/catalog-add',catalogController.create);

router.get('/catalog-edit/:catalog',catalogController.edit);
router.post('/catalog-edit/:catalog',catalogController.update);

router.get('/catalog-view/:table',catalogController.viewuser);

router.get('/catalog-delete/:catalog',catalogController.delete);

//Grupa
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