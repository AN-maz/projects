const Post = require('../models/postModel');

exports.showDashboard = async (req, res) => {

    try {
        const posts = await Post.find().populate('user').sort({ createAt: -1 });

        res.render('dashboard', {
            title: 'Dasboard',
            posts
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}