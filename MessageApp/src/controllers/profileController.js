const User = require('../models/userModel');

exports.showProfileSettings = async (req, res) => {
    res.render('profile-settings', {
        title: 'Pengaturan Profile'
    });
};

exports.updateAvatar = async (req, res) => {

    // LOG PALING PENTING ADA DI SINI
    console.log('--- FUNGSI UPDATE AVATAR DIMULAI ---');
    console.log('File yang diterima multer:', req.file);

    try {
        if (!req.file) {
            req.flash('error', 'Silahkan pilih file gambar MasPur');
            return res.redirect('/profile/settings');
        }

        const userId = req.session.userId;
        const newAvatarPath = req.file.filename;

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

        req.flash('success','Bio berhasil diperbarui MasPur!');
        res.redirect('/profile/settings');
    } catch (err) {
        console.log(err);
        req.flash('error','Terjadi error saat memperbaharui bio');
        res.redirect('/profile/settings');
    }
};