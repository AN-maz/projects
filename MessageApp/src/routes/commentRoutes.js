const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {isAuthenticated} = require('../middlewares/authMiddleware');

router.post('/posts/:postId/comments',isAuthenticated,commentController.createComment);
router.post('/comments/:commentId/like', isAuthenticated, commentController.toggleLikeComment);

module.exports= router;