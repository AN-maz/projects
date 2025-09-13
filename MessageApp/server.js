require('dotenv').config();
const app = require('./src/App');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT,() =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});