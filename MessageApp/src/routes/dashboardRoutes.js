const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuth } = require('../middlewares/authMiddleware');

router.get('/dashboard', isAuth, dashboardController.showDashboard);
module.exports = router;