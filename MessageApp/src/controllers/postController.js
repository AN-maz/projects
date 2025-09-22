const Post = require('../models/postModel');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.userId;

        if (!content || content.trims() === '') {
            req.flash('error', 'Konten postingan tidak boleh kosong');
            return res.redirect('/dashboard');
        }
        const newPostData = {
            content: content,
            user: userId
        };

        if (req.file) {
            newPostData.image = req.file.filename;
        }

        const newPost = new Post(newPostData);
        await newPost.save();

        req.flash('success', 'Postingan berhasil dibuat!');
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal membuat postingan.');
        res.redirect('/dashboard');
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
        }

        const isLiked = post.likes.some(likeId => likeId.equals(userId));

        const updateOperator = isLiked
            ? { $pull: { likes: userId } }
            : { $addToSet: { likes: userId } };

        const updatedPost = await Post.findByIdAndUpdate(postId, updateOperator, { new: true });

        return res.json({
            success: true,
            likesCount: updatedPost.likes.length,
            liked: !isLiked
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        // Cari post berdasarkan ID
        const post = await Post.findById(postId);

        // Jika post tidak ditemukan
        if (!post) {
            req.flash('error', 'Postingan tidak ditemukan.');
            return res.redirect('/dashboard');
        }

        // Pastikan hanya pemilik post yang bisa menghapus
        if (post.user.toString() !== userId) {
            req.flash('error', 'Anda tidak berhak menghapus postingan ini.');
            return res.redirect('/dashboard');
        }

        // Hapus post dari database
        await Post.findByIdAndDelete(postId);

        req.flash('success', 'Postingan berhasil dihapus.');
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal menghapus postingan.');
        res.redirect('/dashboard');
    }
};
