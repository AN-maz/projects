require('dotenv').config();
const app = require('./src/App');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require("socket.io");
const Message = require('./src/models/messageModel');
const Conversation = require('./src/models/conversationModel'); // ✅ hapus duplikasi

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

    // server.js -> io.on('connection', ...)

    // server.js -> di dalam io.on('connection', ...)

    socket.on('sendMessage', async (messageData) => {
        try {
            // 1. Simpan pesan baru ke database
            const newMessage = new Message({
                conversationId: messageData.conversationId,
                sender: messageData.sender,
                content: messageData.content
            });
            const savedMessage = await newMessage.save();

            // 2. Ambil data percakapan yang ada
            const conversation = await Conversation.findById(messageData.conversationId);
            if (!conversation) return; // Hentikan jika percakapan tidak ditemukan

            // 3. Tentukan siapa penerimanya
            const receiverId = conversation.participants.find(id => id.toString() !== messageData.sender);

            // 4. Update percakapan dengan info baru
            await Conversation.findByIdAndUpdate(
                messageData.conversationId,
                {
                    updatedAt: new Date(),
                    lastMessage: { text: savedMessage.content, sender: savedMessage.sender },
                    $addToSet: { unreadBy: receiverId }
                }
            );

            // 5. Ambil data terbaru dari kedua dokumen untuk disiarkan
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('sender', 'username profilePicture');

            const updatedConversation = await Conversation.findById(messageData.conversationId)
                .populate('participants', 'username profilePicture');

            // 6. Kirim pesan baru ke jendela obrolan
            io.to(messageData.conversationId).emit('newMessage', populatedMessage);

            // 7. Kirim pembaruan panel pesan ke semua peserta
            updatedConversation.participants.forEach(participant => {
                const participantSocketId = onlineUsers.get(participant._id.toString());
                if (participantSocketId) {
                    io.to(participantSocketId).emit('conversationUpdated', updatedConversation);
                }
            });

            // 8. Kirim notifikasi pop-up ke penerima
            if (receiverId) {
                const receiverSocketId = onlineUsers.get(receiverId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('newNotification', {
                        title: `Pesan baru dari ${populatedMessage.sender.username}`,
                        message: populatedMessage.content,
                        link: `/messages/${populatedMessage.sender.username}`
                    });

                    // io.to(receiverSocketId).emit('test_event', 'Halo, ini sinyal tes!');
                }
            }

        } catch (err) {
            console.error('Error saat menyimpan atau menyiarkan pesan:', err);
        }
    });

    // ✅ perbaikan nama event: markAsRead
    socket.on('markAsRead', async ({ conversationId, userId }) => {
        try {
            await Conversation.findByIdAndUpdate(conversationId, {
                $pull: { unreadBy: userId }
            });
        } catch (err) {
            console.error('Gagal menandai sudah dibaca:', err);
        }
    });

    socket.on('disconnect', () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
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
