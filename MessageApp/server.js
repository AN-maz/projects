require('dotenv').config();
const app = require('./src/App');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require("socket.io");

const initializeSocket = require('./src/socket/socketHandler');

const server = http.createServer(app);
const io = new Server(server)

initializeSocket(io);
app.set('socketio',io);

const PORT = process.env.PORT || 3000;

connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
