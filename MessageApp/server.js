require('dotenv').config();
const app = require('./src/App');
const connectDB = require('./src/config/db');

const http = require('http');
const { Server } = require("socket.io");
const Message = require('./src/models/messageModel');
const Conversation = require('./src/models/conversationModel');

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('✅ Seorang pengguna terhubung:', socket.id);

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} bergabung ke ruang ${conversationId}`);
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            // Simpan pesan baru
            const newMessage = new Message({
                conversationId: messageData.conversationId,
                sender: messageData.sender,
                content: messageData.content
            });

            const savedMessage = await newMessage.save();

            // Update conversation dengan pesan terakhir
            await Conversation.findByIdAndUpdate(
                messageData.conversationId,
                {
                    lastMessage: {
                        text: savedMessage.content,
                        sender: savedMessage.sender
                    },
                    updatedAt: new Date()
                }
            );

            // Populate sender agar bisa kirim detail user
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('sender', 'username profilePicture');

            // Broadcast ke semua anggota room
            io.to(messageData.conversationId).emit('newMessage', populatedMessage);

        } catch (err) {
            console.error('Error saat menyimpan atau menyiarkan pesan:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Pengguna terputus:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
