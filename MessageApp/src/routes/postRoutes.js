const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuth } = require('../middlewares/authMiddleware');

router.post('/posts', isAuth, postController.createPost);

module.exports = router;