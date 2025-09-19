const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

router.get('/profile/settings', isAuthenticated, profileController.showProfileSettings);
router.post('/profile/avatar', isAuthenticated, upload.single('avatar'), profileController.updateAvatar);
router.post('/profile/bio', isAuthenticated, profileController.updateBio);
router.get('/profile/:username', isAuthenticated, profileController.showPublicProfile);
router.get('/search', isAuthenticated, profileController.searchUsers);
router.post('/profile/:id/follow', isAuthenticated, profileController.toggleFollow);

module.exports = router;