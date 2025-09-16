const User = require('../models/userModel');
const path = require('path'); 
// const Post = require('../models/postModel');
const fs = require('fs');

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

            if(fs.existsSync(oldAvatarPath)){
                fs.unlinkSync(oldAvatarPath);
                console.log('Avatar lama berhasil dihapus MasPur!',oldAvatarPath);
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