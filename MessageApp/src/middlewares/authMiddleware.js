const User = require('../models/userModel');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next(); 
    }
    req.flash('error', 'Anda harus login untuk mengakses halaman ini.');
    res.redirect('/login');
};

const isGuest = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    next(); 
};

const attachUser = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            
            if (user) {
                res.locals.user = user; 
            } else {
                req.session.destroy(); 
                res.locals.user = null;
            }
        } catch (err) {
            console.error('Gagal mengambil data user:', err);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = {
    isAuthenticated,
    isGuest,
    attachUser
};