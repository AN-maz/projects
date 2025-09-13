const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require('express-session'); 
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// 1. Middleware umum (wajib sebelum session dan rute)
app.use(express.urlencoded({ extended: true }));

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

// 4. GUNAKAN RUTE-RUTE
app.get('/', (req, res) => {

    if(req.session.userId){
        res.redirect('/dashboard');
    }else{
        res.redirect('/login');
    }
});

app.use(authRoutes);
app.use(dashboardRoutes);

module.exports = app;