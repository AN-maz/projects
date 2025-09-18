const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Rute untuk MEMULAI percakapan baru (dari halaman profil)
router.post('/messages/new/:userId', isAuthenticated, messageController.startConversation);
// Rute untuk MELIHAT isi sebuah percakapan
router.get('/messages/:username', isAuthenticated, messageController.showConversation);

// Rute untuk MENGIRIM pesan dari halaman percakapan
// router.post('/messages/:username', isAuthenticated, messageController.sendMessage);

module.exports = router;