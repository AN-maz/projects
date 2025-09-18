const Post = require('../models/postModel');
const Conversation = require('../models/conversationModel');

exports.showDashboard = async (req, res) => {

    try {
        
        if (!res.locals.user) {
            return res.redirect('/login');
        }

        const currentUser = res.locals.user;

        // const posts = await Post.find().populate('user').sort({ createdAt: -1 });

        const posts = await Post.find()
        .populate('user')
        .populate({
            path: 'comments',
            options: {sort: {createdAt: 'asc'}},
            populate:{
                path:'user',
                select: 'username profilePicture'
            }
        })
        .sort({createdAt: -1});

        const conversations = await Conversation.find({ participants: currentUser._id })
            .populate({
                path: 'participants',
                select: 'username profilePicture'
            })
            .sort({ updatedAt: -1 });

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
}