const Message = require('../models/messageModel');
const conversation = require('../models/conversationModel');

const onlineUsers = new Map();

module.exports = function (io) {
    
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

                if (!conversation) return;

                const receiverId = conversation.participants.find(id => id.toString() !== messageData.sender);

                await Conversation.findByIdAndUpdate(
                    messageData.conversationId,
                    {
                        updatedAt: new Date(),
                        lastMessage: { text: savedMessage.content, sender: savedMessage.sender },
                        $addToSet: { unreadBy: receiverId }
                    }
                );

                const populatedMessage = await Message.findById(savedMessage._id)
                    .populate('sender', 'username profilePicture');

                const updatedConversation = await Conversation.findById(messageData.conversationId)
                    .populate('participants', 'username profilePicture');

                io.to(messageData.conversationId).emit('newMessage', populatedMessage);

                updatedConversation.participants.forEach(participant => {
                    const participantSocketId = onlineUsers.get(participant._id.toString());
                    if (participantSocketId) {
                        io.to(participantSocketId).emit('conversationUpdated', updatedConversation);
                    }
                });

                if (receiverId) {
                    const receiverSocketId = onlineUsers.get(receiverId.toString());
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('newNotification', {
                            title: `Pesan baru dari ${populatedMessage.sender.username}`,
                            message: populatedMessage.content,
                            link: `/messages/${populatedMessage.sender.username}`
                        });
                    }
                }

            } catch (err) {
                console.error('Error saat menyimpan atau menyiarkan pesan:', err);
            }
        });

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
}