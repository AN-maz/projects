const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuth } = require('../middlewares/authMiddleware');

router.post('/posts', isAuth, postController.createPost);
router.post('/posts/:id/like', isAuth, postController.toggleLike);

module.exports = router;
``