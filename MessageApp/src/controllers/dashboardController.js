const Post = require('../models/postModel');

exports.showDashboard = async (req, res) => {

    try {
        const posts = await Post.find().populate('user').sort({ createAt: -1 });

        res.render('dashboard', {
            title: 'Dasboard',
            posts,
            // layout: 'layouts/main-layout',
            // user: req.user || null // baris baru
        
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}