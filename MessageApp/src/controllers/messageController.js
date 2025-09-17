const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel'); // <-- 1. DIPERBAIKI

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
            participants: { $all: [currentUser._id, otherUser._id] } // <-- 2. DIPERBAIKI
        });

        let messages = [];

        if (conversation) {
            messages = await Message.find({ conversationId: conversation._id })
                .populate('sender', 'username profilePicture')
                .sort({ createdAt: 'asc' });
        }

        const conversations = await Conversation.find({ participants: currentUser._id })
            .populate({
                path: 'participants',
                select: 'username profilePicture'
            })
            .sort({ updatedAt: -1 });

        res.render('conversation', {
            title: `Pesan dengan ${otherUser.username}`,
            otherUser,
            messages, // <-- 3. DIPERBAIKI
            conversations
        });

    } catch (err) {
        console.error("Error in showConversation:", err);
        res.redirect('/dashboard');
    }
}

exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const sender = res.locals.user;
        const receiverUsername = req.params.username;

        const receiver = await User.findOne({ username: receiverUsername });
        if (!receiver) return res.redirect('/dashboard'); // <-- 4. DIPERBAIKI

        let conversation = await Conversation.findOne({
            participants: { $all: [sender._id, receiver._id] }
        });

        if (!conversation) {
            // Ini seharusnya tidak terjadi, tapi untuk jaga-jaga
            conversation = new Conversation({ participants: [sender._id, receiver._id] });
            await conversation.save(); 
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: sender._id,
            content
        });
        
        await Promise.all([
            newMessage.save(),
            conversation.updateOne({ updatedAt: new Date() })
        ]);

        res.redirect(`/messages/${receiver.username}`); // <-- 4. DIPERBAIKI

    } catch (err) {
        console.error("Error in sendMessage:", err);
        req.flash('error', 'Gagal mengirim pesan.');
        res.redirect('/dashboard');
    }
}