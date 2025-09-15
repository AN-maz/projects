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

module.exports = { isAuth, isGuest };