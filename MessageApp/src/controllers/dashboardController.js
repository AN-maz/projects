const Post = require('../models/postModel');
const Conversation = require('../models/conversationModel');

exports.showDashboard = async (req, res) => {

    try {

        if (!res.locals.user) {
            return res.redirect('/login');
        }

        const posts = await Post.find().populate('user').sort({ createdAt: -1 });

        const conversation = await Conversation.find({ participants: res.locals.user._id })
            .populate({
                path: 'participants',
                select: 'username profilePictures'
            })
            .sort({ updatedAt: -1 });

        res.render('dashboard', {
            title: 'Dasboard',
            posts,
            conversation
            // layout: 'layouts/main-layout',
            // user: req.user || null // baris baru
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}