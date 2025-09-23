const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');

exports.startConversation = async (req, res) => {
    try {
        const senderId = res.locals.user._id;
        const receiverId = req.params.userId;

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            req.flash('error', 'Pengguna tidak ditemukan');
            return res.redirect('back');
        }

        const existingConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (existingConversation) {
            return res.redirect(`/messages/${receiver.username}`);
        }

        const newConversation = new Conversation({
            participants: [senderId, receiverId]
        });

        await newConversation.save();
        return res.redirect(`/messages/${receiver.username}`);

    } catch (err) {
        console.error("Error in startConversation:", err);
        req.flash('error', 'Gagal memulai percakapan.');
        res.redirect('back');
    }
};

exports.showConversation = async (req, res) => {
    try {
        const currentUser = res.locals.user;
        const otherUserUsername = req.params.username;

        const otherUser = await User.findOne({ username: otherUserUsername });
        if (!otherUser) return res.status(404).render('not-found');

        const conversation = await Conversation.findOne({
            participants: { $all: [currentUser._id, otherUser._id] }
        });

        let messages = [];

        if (conversation) {
            messages = await Message.find({ conversationId: conversation._id })
                .populate('sender', 'username profilePicture')
                .sort({ createdAt: 'asc' });
        };

        const conversations = await Conversation.find({ participants: currentUser._id })
            .populate({
                path: 'participants',
                select: 'username profilePicture'
            })
            .populate({
                path: 'lastMessage',
                select: 'content createdAt sender'
            })
            .sort({ updatedAt: -1 });


        let conversationId = null;
        if (conversation) {
            conversationId = conversation._id.toString();
        }

        res.render('conversation', {
            title: `Pesan dengan ${otherUser.username}`,
            otherUser,
            messages,
            conversations,
            conversationId
        });

    } catch (err) {
        console.error("Error in showConversation:", err);
        res.redirect('/dashboard');
    }
};

exports.deleteMessage = async (req, res) => {

    try {
        const messageId = req.params.id;
        const userId = req.session.userId;
        const io = req.app.get('socketio');

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan.' });
        }
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Anda tidak berhak menghapus pesan ini.' });
        }

        const conversationId = message.conversationId;
        await Message.findByIdAndDelete(messageId);
        io.to(conversationId.toString()).emit('messageDeleted', { messageId, conversationId: conversationId.toString() });

        const newLastMessage = await Message.findOne({ conversationId })
            .sort({ createdAt: -1 })
            .populate('sender', '_id');

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newLastMessage ? {
                content: newLastMessage.content,
                sender: newLastMessage.sender._id
            } : null
        });

        const updatedConversation = await Conversation.findById(conversationId)
            .populate('participants', 'username profilePicture');

        updatedConversation.participants.forEach(participant => {
            io.to(participant._id.toString()).emit('conversationUpdated', {
                ...updatedConversation.toObject(),
                lastMessage: newLastMessage ? {
                    content: newLastMessage.content,
                    sender: newLastMessage.sender._id
                } : null
            });
        });

        res.json({ success: true, message: 'Pesan berhasil dihapus.' });

    } catch (error) {
        console.error("Gagal menghapus pesan:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

exports.editMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const { content } = req.body;
        const userId = res.locals.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan.' });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Anda tidak berhak mengedit pesan ini.' });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        const io = req.app.get('socketio');
        io.to(message.conversationId.toString()).emit('messageEdited', {
            messageId: message._id,
            content: message.content
        });

        res.json({ success: true, message: 'Pesan berhasil diperbarui.' });

    } catch (error) {
        console.error("Gagal mengedit pesan:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};
