const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middlewares/authMiddleware');

router.get('/register', isGuest, authController.showRegisterPage);
router.post('/register', isGuest, authController.registerUser);

router.get('/login', isGuest, authController.showLoginPage);
router.post('/login', isGuest, authController.loginUser);

router.get('/logout',authController.logoutUser);

module.exports = router;   