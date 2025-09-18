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