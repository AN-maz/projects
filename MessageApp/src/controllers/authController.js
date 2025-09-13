const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Menampilkan halaman registrasi
exports.showRegisterPage = (req, res) => res.render('register', { title: 'Register' });

// Memproses data registrasi
exports.registerUser = async (req, res) => {
    try {
        const { username, password, passwordConfirm } = req.body;
        if (password !== passwordConfirm) {
            return res.status(400).send('Password tidak cocok.');
        }

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).send('Username sudah digunakan.');
        }

        user = new User({ username, password });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Terjadi error di server');
    }
};

// Menampilkan halaman login
exports.showLoginPage = (req, res) => res.render('login', { title: 'Login' });

// Memproses data login
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Username atau password salah.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Username atau password salah.');
        }

        
        req.session.userId = user._id;
        res.redirect('/dashboard'); 
    } catch (err) {
        res.status(500).send('Terjadi error di server');
    }
};

// Proses Logout
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Gagal untuk logout.');
        }
        res.redirect('/login');
    });
};