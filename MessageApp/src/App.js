const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const postRoutes = require('./routes/postRoutes')
const profileRoutes = require('./routes/profileRoutes');    
const User = require('./models/userModel');
const { attachUser } = require('./middlewares/authMiddleware'); 
const messageRoutes = require('./routes/messageRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

app.use((req, res, next) => {
    console.log(`Request Masuk: ${req.method} ${req.originalUrl}`);
    next();
});


// 1. Middleware umum (wajib sebelum session dan rute)
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 2. Pengaturan View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout');

// 3. MIDDLEWARE SESSION (WAJIB SEBELUM RUTE)
app.use(
    session({
        secret: 'kucing-poi-lucu-bet',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.use(flash());

app.use((req,res,next) =>{
    res.locals.messages = req.flash();
    next();
});

// app.use(async (req, res, next, err) => {
//     if (req.session.userId) {
//         const user = await User.findById(req.session.userId);
//         res.locals.user = user || null;
//         next();
//     } else {
//         console.error("Error fetch user:", err);
//         res.locals.user = null;
//     }
//     next();
// });

app.use(attachUser);

// 4. GUNAKAN RUTE-RUTE
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});


app.use(authRoutes);
app.use(dashboardRoutes);
app.use(postRoutes);
app.use(profileRoutes);
app.use(messageRoutes);
app.use(commentRoutes);

module.exports = app;