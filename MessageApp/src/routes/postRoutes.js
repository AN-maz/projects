const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuth } = require('../middlewares/authMiddleware');
const postUpload = require('../config/postUpload');

// router.post('/posts', isAuth, postController.createPost);
router.post('/posts', isAuth, postUpload.single('postImage'), postController.createPost);
router.post('/posts/:id/like', isAuth, postController.toggleLike);

module.exports = router;
