const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const postUpload = require('../config/postUpload');

// router.post('/posts', isAuthenticated, postController.createPost);
router.post('/posts', isAuthenticated, postUpload.single('postImage'), postController.createPost);
router.post('/posts/:id/like', isAuthenticated, postController.toggleLike);

module.exports = router;
