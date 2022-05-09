const express = require('express');
const router = express.Router();

router.get('/student-orar/:grupa', studentController.isLoggedIn, studentController.viewOrar);

router.get('/student-alte-grupe',studentController.isLoggedIn,studentController.viewAlteGrupe);
router.get('/student-alte-grupe/:grupa',studentController.isLoggedIn,studentController.viewAlteGrupeOrar);

router.get('/student-catalog/:grupa/:email', studentController.isLoggedIn, studentController.viewCatalog);

router.get('/student-financiar/:grupa/:email', studentController.isLoggedIn, studentController.viewFinanciar);

router.get('/student-admini', studentController.isLoggedIn, studentController.viewAdmini);

module.exports = router;