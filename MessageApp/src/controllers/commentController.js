const Comment = require('../models/commentModel');

exports.createComment = async (req, res) => {
    // Tentukan URL untuk kembali ke halaman sebelumnya
    const backURL = req.header('Referer') || '/dashboard';

    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.session.userId;

        if (!content || !postId || !userId) {
            req.flash('error', 'Gagal membuat komentar. Data tidak lengkap atau Anda tidak login.');
            return res.redirect(backURL); // <-- Gunakan backURL
        }

        const newComment = new Comment({
            post: postId,
            user: userId,

            content: content
        });

        await newComment.save();
        req.flash('success', 'Komentar berhasil ditambahkan.');
        res.redirect(backURL); // <-- Gunakan backURL

    } catch (error) {
        console.error('Gagal membuat komentar:', error);
        req.flash('error', 'Gagal memposting komentar.');
        res.redirect(backURL); // <-- Gunakan backURL juga di sini
    }
};


exports.toggleLikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.session.userId;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Komentar tidak ditemukan' });
        }

        const isLiked = comment.likes.includes(userId);

        if (isLiked) {
            await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
        } else {
            await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });
        }
        
        const updatedComment = await Comment.findById(commentId);
        
        res.json({
            success: true,
            liked: !isLiked, 
            likesCount: updatedComment.likes.length 
        });

    } catch (error) {
        console.error('Gagal like komentar:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};