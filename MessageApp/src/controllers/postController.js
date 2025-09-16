const Post = require('../models/postModel');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.userId;

        // 1. Siapkan data dalam objek JavaScript BIASA (bukan 'new Post')
        const newPostData = {
            content: content,
            user: userId
        };

        // 2. Cek apakah ada file, JIKA ADA, tambahkan ke objek BIASA tadi
        if (req.file) {
            newPostData.image = req.file.filename;
        }

        // 3. BARU SETELAH SEMUA DATA LENGKAP, buat dokumen Mongoose-nya
        const newPost = new Post(newPostData);
        
        // 4. Simpan dokumennya ke database
        await newPost.save();
        
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        // Tambahkan flash message agar user tahu jika ada error
        req.flash('error', 'Gagal membuat postingan.');
        res.redirect('/dashboard');
    }
};

// LIKE/UNLIKE
exports.toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        // pastikan postId valid
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ success: false, message: 'Invalid postId' });
        }

        // pastikan userId valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid userId' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
        }

        const isLiked = post.likes.some(likeId => likeId.toString() === userId.toString());

        if (isLiked) {
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
        } else {
            await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
        }

        const updatedPost = await Post.findById(postId);

        return res.json({
            success: true,
            likesCount: updatedPost.likes.length,
            liked: !isLiked
        });
    } catch (err) {
        console.log(err);
        req.flash('error', 'Terjadi kesalahan');
        res.redirect('back');
    }
}
