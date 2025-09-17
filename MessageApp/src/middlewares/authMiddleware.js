const User = require('../models/userModel');

// MIDDLEWARE UNTUK ROUTE SETELAH LOGIN 
const isAuth = (req, res, next) => {

    // DEBUG
    console.log('Middleware isAuth dijalankan. Isi req.session:', req.session);

    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// MIDDLEWARE UNTUK ROUTE YG BELUM LOGIN (TAMU)
const isGuest = (req, res, next) => {

    // DEBUG
    console.log('Middleware isGuest dijalankan. Isi req.session:', req.session);

    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

// Middleware inject user ke res.locals
const attachUser = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            res.locals.user = user; // ini bisa langsung dipakai di semua EJS
        } catch (err) {
            console.error('Gagal ambil user:', err);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

const isAuthenticated = (req,res,next) =>{
    if(res.locals.user){
        return next();
    }
    req.flash('error','Anda harus login untuk mengakses halaman ini');
    res.redirect('/login');
}
module.exports = { isAuth, isGuest, attachUser, isAuthenticated };