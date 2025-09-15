const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Menampilkan halaman registrasi
exports.showRegisterPage = (req, res) => {
    res.render('register', {
        title: 'Register',
        errorMessage: req.flash('error')
    });
};

// Memproses data registrasi
exports.registerUser = async (req, res) => {
    try {
        const { username, password, passwordConfirm } = req.body;

        if (password !== passwordConfirm) {
            console.log('Error: Password tidak cocok.');
            // return res.status(400).send('Password tidak cocok.');

            req.flash('error', 'Password tidak cocok MasPur!');
            return res.redirect('/register');
        }

        let user = await User.findOne({ username });
        if (user) {
            console.log('Error: Username sudah digunakan.');
            // return res.status(400).send('Username sudah digunakan.');

            req.flash('error', 'Username sudah digunakan MasPur!');
            return res.redirect('/register');
        }

        user = new User({ username, password });

        await user.save();

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        // res.status(500).send('Terjadi error di server saat registrasi.');
        req.flash('error', 'Terjadi error di server saat registrasi MasPur!');
        return res.redirect('/register');


    }
};

// Menampilkan halaman login
exports.showLoginPage = (req, res) => {
    res.render('login', {
        title: 'Login',
        errorMessage: req.flash('error')
    });
};


// Memproses data login
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'username atau password salah MasPur!');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'username atau password salah MasPur!');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'terjadi error di server');
        return res.redirect('/login');
    }
};

// Proses Logout
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            req.flash('error', 'Gagal untuk logout MasPur!');
            return res.redirect('/dashboard');
        }
        res.redirect('/login');
    });
};