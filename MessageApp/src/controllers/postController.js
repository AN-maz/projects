const Post = require('../models/postModel');

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