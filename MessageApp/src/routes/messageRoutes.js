const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.post('/messages/new/:userId', isAuthenticated, messageController.startConversation);
router.get('/messages/:username', isAuthenticated, messageController.showConversation);
router.delete('/messages/:id', isAuthenticated, messageController.deleteMessage);

module.exports = router;