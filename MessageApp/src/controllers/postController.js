const Post = require('../models/postModel');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.userId;

        const newPost = new Post({
            content,
            user: userId
        });

        await newPost.save();

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
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