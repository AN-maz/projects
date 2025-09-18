// controllers/commentController.js
const Comment = require('../models/commentModel');

// exports.createComment = async (req, res) => {
//     // Tentukan URL untuk kembali ke halaman sebelumnya
//     const backURL = req.header('Referer') || '/dashboard';

//     try {
//         const { content, parentCommentId } = req.body;
//         const postId = req.params.postId;
//         const userId = req.session.userId;

//         // Validasi data
//         if (!content || !postId || !userId) {
//             req.flash('error', 'Gagal membuat komentar. Data tidak lengkap atau Anda tidak login.');
//             return res.redirect(backURL);
//         }

//         const newComment = new Comment({
//             post: postId,
//             user: userId,
//             content: content,
//             parentComment: parentCommentId || null // dukung nested comment
//         });

//         await newComment.save();
//         req.flash('success', 'Komentar berhasil ditambahkan.');
//         res.redirect(backURL);

//     } catch (error) {
//         console.error('Gagal membuat komentar:', error);
//         req.flash('error', 'Gagal memposting komentar.');
//         res.redirect(backURL);
//     }
// };

exports.createComment = async (req, res) => {
    try {
        const { content, parentCommentId } = req.body;
        const postId = req.params.postId;
        const userId = req.session.userId;

        const newComment = new Comment({
            post: postId,
            user: userId,
            content: content,
            parentComment: parentCommentId || null
        });

        await newComment.save();
        
        // Populate data user agar bisa ditampilkan di front-end
        const populatedComment = await Comment.findById(newComment._id)
                                               .populate('user', 'username profilePicture');

        // Kirim balik data komentar baru dalam format JSON
        res.status(201).json({ success: true, comment: populatedComment });

    } catch (error) {
        console.error('Gagal membuat komentar:', error);
        res.status(500).json({ success: false, message: 'Gagal memposting komentar.' });
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
