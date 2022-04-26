const express = require('express');
const router = express.Router();

router.get('/student-orar/:grupa',studentController.isLoggedIn,studentController.viewOrar);

router.get('/student-catalog/:grupa/:email',studentController.isLoggedIn,studentController.viewCatalog);

module.exports = router;