const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuth } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

router.get('/profile/settings', isAuth, profileController.showProfileSettings);
router.post('/profile/avatar', isAuth, upload.single('avatar'), profileController.updateAvatar);
router.post('/profile/bio', isAuth, profileController.updateBio);

module.exports = router;