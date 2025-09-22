
import { initChatHandlers } from './modules/chatHandler.js'; 
import { initCommentHandlers } from './modules/commentHandler.js';
import { initSocketHandlers } from './modules/socketHandler.js';
import { initLikeHandlers } from './modules/likeHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM siap, memulai inisialisasi modul...");

    // Panggil semua fungsi inisialisasi dari modul Anda
    initChatHandlers();
    initCommentHandlers();
    initSocketHandlers();
    initLikeHandlers(); 
});