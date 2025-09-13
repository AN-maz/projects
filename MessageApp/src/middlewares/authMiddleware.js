// MIDDLEWARE UNTUK ROUTE SETELAH LOGIN 
const isAuth = (req,res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// MIDDLEWARE UNTUK ROUTE YG BELUM LOGIN (TAMU)
const isGuest = (req,res, next) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        next(); 
    }
};

module.exports = { isAuth, isGuest };