const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/index', authController.isLoggedIn, (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/register', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        if (req.user.admin) {
            res.render('register', { user: req.user, title: 'register-layout', layout: 'profile-auth' });
        } else {
            res.redirect('/profile', { title: 'profile-layout', layout: 'profile-auth' });
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/registerAdmin/:email', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        if (req.user.admin) {
            res.render('register-admin', { user: req.user, title: 'register-layout', layout: 'profile-auth' });
        } else {
            res.redirect('/profile', { title: 'profile-layout', layout: 'profile-auth' });
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'register-layout', layout: 'profile-auth' });
});


//Orar
const orarController = require('../controllers/orarController');

router.get('/orar', orarController.isLoggedIn, orarController.view);
router.post('/orar', orarController.isLoggedIn, orarController.find);

router.get('/orar-add', orarController.isLoggedIn, orarController.form);
router.post('/orar-add', orarController.isLoggedIn, orarController.create);

router.get('/orar-edit/:grupa/:id', orarController.isLoggedIn, orarController.edit);
router.post('/orar-edit/:grupa/:id', orarController.isLoggedIn, orarController.update);

router.get('/orar-view/:grupa', orarController.isLoggedIn, orarController.viewuser);

router.get('/orar-delete/:grupa/:id', orarController.isLoggedIn, orarController.delete);

//Catalog
const catalogController = require('../controllers/catalogController');

router.get('/catalog', catalogController.isLoggedIn, catalogController.view);
router.post('/catalog', catalogController.isLoggedIn, catalogController.find);

router.get('/catalog-add', catalogController.isLoggedIn, catalogController.form);
router.post('/catalog-add', catalogController.isLoggedIn, catalogController.create);

router.get('/catalog-edit/:catalog', catalogController.isLoggedIn, catalogController.edit);
router.post('/catalog-edit/:catalog', catalogController.isLoggedIn, catalogController.update);

router.get('/catalog-view/:table', catalogController.isLoggedIn, catalogController.viewuser);

router.get('/catalog-delete/:catalog', catalogController.isLoggedIn, catalogController.delete);

//Grupa
const grupaController = require('../controllers/grupaController');

router.get('/grupa/:grupa', grupaController.isLoggedIn, grupaController.view);
router.post('/grupa/:grupa', grupaController.isLoggedIn, grupaController.find);

router.get('/grupa/:grupa/student-add', grupaController.isLoggedIn, grupaController.form);
router.post('/grupa/:grupa/student-add', grupaController.isLoggedIn, grupaController.create);

router.get('/grupa/:grupa/student-edit/:email', grupaController.isLoggedIn, grupaController.edit);
router.post('/grupa/:grupa/student-edit/:email', grupaController.isLoggedIn, grupaController.update);

router.get('/grupa/:grupa/student-view/:id', grupaController.isLoggedIn, grupaController.viewuser);

router.get('/grupa/:grupa/student-delete/:email', grupaController.isLoggedIn, grupaController.delete);

//Secretariat
router.get('/secretariat', authController.isLoggedIn, (req, res) => {
    res.render('secretariat', { user: req.user });
});

//Biblioteca
router.get('/biblioteca', authController.isLoggedIn, (req, res) => {
    res.render('biblioteca', { user: req.user });
});

//Financiar
const financiarController = require('../controllers/financiarController');

router.get('/financiar', financiarController.isLoggedIn, financiarController.view);
router.post('/financiar', financiarController.isLoggedIn, financiarController.find);

router.get('/financiar-view/:table', financiarController.isLoggedIn, financiarController.viewuser);

//Profile
const profileController = require('../controllers/profileController');

router.get('/profile', profileController.isLoggedIn, profileController.view);

router.get('/profileEdit/:email', profileController.isLoggedIn, profileController.edit);
router.post('/profileEdit/:email', profileController.isLoggedIn, profileController.update);

router.get('/profileVisit/:email',profileController.isLoggedIn,profileController.visit);

//Student
const studentController = require('../controllers/studentController');

router.get('/student-orar/:grupa', studentController.isLoggedIn, studentController.viewOrar);

router.get('/student-catalog/:grupa/:email', studentController.isLoggedIn, studentController.viewCatalog);

router.get('/student-financiar/:grupa/:email', studentController.isLoggedIn, studentController.viewFinanciar);

module.exports = router;

