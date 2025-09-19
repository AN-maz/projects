
const Comment = require('../models/commentModel');

exports.createComment = async (req, res) => {
    try {

        const io = req.app.get('socketio');

        const { content, parentCommentId } = req.body;
        const postId = req.params.postId;
        const userId = req.session.userId;

        const commentData = {
            post: postId,
            user: userId,
            content,
            parentComment: parentCommentId || null
        };

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment) {
                commentData.replyingTo = parentComment.user;
            }
        }
        const newComment = new Comment(commentData);
        await newComment.save();

        const populatedComment = await Comment.findById(newComment._id)
            .populate('user', 'username profilePicture')
            .populate('replyingTo','username');

        io.to(postId).emit('newComment', populatedComment);
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
