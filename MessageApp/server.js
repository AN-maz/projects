require('dotenv').config();
const app = require('./src/App');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require("socket.io");
const Message = require('./src/models/messageModel');
const Conversation = require('./src/models/conversationModel');

const server = http.createServer(app);
const io = new Server(server);
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('✅ Seorang pengguna terhubung:', socket.id);

    socket.on('register', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log('Pengguna terdaftar:', userId, 'dengan socket:', socket.id);
    });

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} bergabung ke ruang ${conversationId}`);
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            const newMessage = new Message({
                conversationId: messageData.conversationId,
                sender: messageData.sender,
                content: messageData.content
            });
            const savedMessage = await newMessage.save();

            const conversation = await Conversation.findById(messageData.conversationId);
            await conversation.updateOne({
                updatedAt: new Date(),
                lastMessage: { text: savedMessage.content, sender: savedMessage.sender }
            });

            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('sender', 'username profilePicture');

            // Kirim pesan ke ruang obrolan
            io.to(messageData.conversationId).emit('newMessage', populatedMessage);

            // Kirim notifikasi
            const receiverId = conversation.participants.find(id => id.toString() !== messageData.sender);
            if (receiverId) {
                const receiverSocketId = onlineUsers.get(receiverId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('newNotification', {
                        title: `Pesan baru dari ${populatedMessage.sender.username}`,
                        message: populatedMessage.content,
                        link: `/messages/${populatedMessage.sender.username}` // <-- Link diperbaiki
                    });
                }
            }
        } catch (err) {
            console.error('Error saat menyimpan atau menyiarkan pesan:', err);
        }
    });

    socket.on('disconnect', () => { // <-- Nama event diperbaiki
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) { // <-- Variabel diperbaiki
                onlineUsers.delete(userId);
                break;
            }
        }
        console.log('❌ Pengguna terputus:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
connectDB();
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});