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

router.get('/orar',orarController.isLoggedIn, orarController.view);
router.post('/orar',orarController.isLoggedIn, orarController.find);

router.get('/orar-add',orarController.isLoggedIn,orarController.form);
router.post('/orar-add',orarController.isLoggedIn,orarController.create);

router.get('/orar-edit/:id',orarController.isLoggedIn,orarController.edit);
router.post('/orar-edit/:id',orarController.isLoggedIn,orarController.update);

router.get('/orar-view/:id',orarController.isLoggedIn,orarController.viewuser);

router.get('/orar-delete/:id',orarController.isLoggedIn,orarController.delete);

//Catalog
const catalogController = require('../controllers/catalogController');

router.get('/catalog',catalogController.isLoggedIn ,catalogController.view);
router.post('/catalog',catalogController.isLoggedIn, catalogController.find);

router.get('/catalog-add',catalogController.isLoggedIn,catalogController.form);
router.post('/catalog-add',catalogController.isLoggedIn,catalogController.create);

router.get('/catalog-edit/:catalog',catalogController.isLoggedIn,catalogController.edit);
router.post('/catalog-edit/:catalog',catalogController.isLoggedIn,catalogController.update);

router.get('/catalog-view/:table',catalogController.isLoggedIn,catalogController.viewuser);

router.get('/catalog-delete/:catalog',catalogController.isLoggedIn,catalogController.delete);

//Grupa
const grupaController = require('../controllers/grupaController');

router.get('/grupa/:grupa',grupaController.isLoggedIn ,grupaController.view);
router.post('/grupa/:grupa',grupaController.isLoggedIn, grupaController.find);

router.get('/grupa/:grupa/student-add',grupaController.isLoggedIn,grupaController.form);
router.post('/grupa/:grupa/student-add',grupaController.isLoggedIn,grupaController.create);

router.get('/grupa/:grupa/student-edit/:id',grupaController.isLoggedIn,grupaController.edit);
router.post('/grupa/:grupa/student-edit/:id',grupaController.isLoggedIn,grupaController.update);

router.get('/grupa/:grupa/student-view/:id',grupaController.isLoggedIn,grupaController.viewuser);

router.get('/grupa/:grupa/student-delete/:id',grupaController.isLoggedIn,grupaController.delete); 

module.exports = router;