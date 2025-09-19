// controllers/dashboardController.js
const Post = require('../models/postModel');
const Conversation = require('../models/conversationModel');

exports.showDashboard = async (req, res) => {
    try {
        // Cek login
        if (!res.locals.user) {
            return res.redirect('/login');
        }

        const currentUser = res.locals.user;

        // Ambil posts + comments + user
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // urutkan post dari terbaru ke lama
            .populate('user') // populate user di setiap post
            .populate({
                path: 'comments',
                options: { sort: { createdAt: 'asc' } }, // urutkan komentar dari lama ke baru
                populate: [
                    { path: 'user', select: 'username profilePicture' },
                    { path: 'replyingTo', select: 'username' } // tambahkan relasi replyingTo
                ]
            });


        // --- Susun komentar jadi nested ---
        posts.forEach(post => {
            const commentMap = {};
            const nestedComments = [];

            // Buat map komentar berdasarkan ID
            post.comments.forEach(comment => {
                commentMap[comment._id] = comment;
                comment.replies = []; // buat tempat untuk balasan
            });

            // Susun struktur nested
            post.comments.forEach(comment => {
                if (comment.parentComment) {
                    if (commentMap[comment.parentComment]) {
                        commentMap[comment.parentComment].replies.push(comment);
                    }
                } else {
                    nestedComments.push(comment);
                }
            });

            // Ganti array comments dengan nested structure
            post.comments = nestedComments;
        });
        // --- Akhir nested comments ---

        // Ambil conversations
        const conversations = await Conversation.find({ participants: currentUser._id })
            .populate({
                path: 'participants',
                select: 'username profilePicture'
            })
            .sort({ updatedAt: -1 });

        // Render dashboard
        res.render('dashboard', {
            title: 'Dashboard',
            posts,
            conversations
        });

    } catch (err) {
        console.error("Error in showDashboard:", err);
        req.flash('error', 'Terjadi kesalahan saat memuat dashboard.');
        res.redirect('/login');
    }
};
