const User = require('../models/userModel');
const path = require('path');
const Post = require('../models/postModel');
const fs = require('fs');

exports.showPublicProfile = async (req, res) => {
    try {
        const profileUser = await User.findOne({ username: req.params.username });

        if (!profileUser) {
            return res.status(404).render('not-found', { title: 'User tidak ditemukan!' });
        }

        const posts = await Post.find({ user: profileUser._id }).sort({ createdAt: -1 });

        res.render('profile', {
            title: `profle ${profileUser.username}`,
            profileUser,
            posts
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};

exports.showProfileSettings = async (req, res) => {
    res.render('profile-settings', {
        title: 'Pengaturan Profile'
    });
};

exports.updateAvatar = async (req, res) => {

    try {
        if (!req.file) {
            req.flash('error', 'Silahkan pilih file gambar MasPur');
            return res.redirect('/profile/settings');
        }

        const userId = req.session.userId;
        const newAvatarPath = req.file.filename;

        const user = await User.findById(userId);

        if (user && user.profilePicture) {

            const oldAvatarPath = path.join(__dirname, '../../public/uploads/avatars', user.profilePicture);

            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
                console.log('Avatar lama berhasil dihapus MasPur!', oldAvatarPath);
            }
        }

        await User.findByIdAndUpdate(userId, { profilePicture: newAvatarPath });
        req.flash('success', 'Foto profile berhasil diperbarui!');
        res.redirect('/profile/settings');

    } catch (err) {
        console.log(err);
        console.error('ERROR DI DALAM CATCH UPDATE AVATAR:', err);
        req.flash('error', "Terjadi error saat meng-upload gambar");
        res.redirect('/profile/settings');
    }
};

exports.updateBio = async (req, res) => {
    try {
        const { bio } = req.body;
        const userId = req.session.userId;

        await User.findByIdAndUpdate(userId, { bio: bio });

        req.flash('success', 'Bio berhasil diperbarui MasPur!');
        res.redirect('/profile/settings');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Terjadi error saat memperbaharui bio');
        res.redirect('/profile/settings');
    }
};

// SEACRH 
exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.render('search-results', {
                title: 'Cari Pengguna',
                users: [],
                query: ''
            });
        }
        const users = await User.find({
            username: new RegExp(query, 'i')
        });

        res.render('search-results', {
            title: `Hasil untuk ${query}`,
            users,
            query
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};

// FOLLOW UNFOLLOW
exports.toggleFollow = async (req, res) => {

    try {
        const profileUserId = req.params.id;
        const currentUserId = req.session.userId;

        if (profileUserId === currentUserId) {
            req.flash('error', 'Anda tidak bisa mengikuti diri sendiri');
            return res.redirect('back');
        }

        const currentUser = await User.findById(currentUserId);
        const profileUser = await User.findById(profileUserId);

        if (currentUser.following.includes(profileUserId)) {
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: profileUserId } });
            await User.findByIdAndUpdate(profileUserId,{$pull: {followers:currentUserId }});
            req.flash(`success','Anda berhenti mengikuti ${profileUser.username}`);
        }else{
            await User.findByIdAndUpdate(currentUserId,{$addToSet:{following: profileUserId}});
            await User.findByIdAndUpdate(currentUserId,{$addToSet:{followers: currentUserId}});
            req.flash('success',`Anda sekarang mengikuti ${profileUser.username}`);
        }
        res.redirect(`/profile/${profileUser.username}`);

    } catch (err) {
        console.error(err);
        req.flash('error','Terjadi kesalahan.');
        res.redirect('back');
    }
}