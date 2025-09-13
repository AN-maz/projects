const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();
// const port = 3000;

app.set('view engine','ejs');
app.use(expressLayouts);

app.get('/', (req,res) =>{
    const data = {
        title: 'Halaman-Utama',
        layout: 'layouts/main-layout'
    }
    res.render('index',data);
})

// app.listen(port,() =>{
//     console.log(`server berjalan di http://localhost:${port}`);
// })

module.exports = app;