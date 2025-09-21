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
        }

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

        res.render('conversation', {
            title: `Pesan dengan ${otherUser.username}`,
            otherUser,
            messages,
            conversations
        });

    } catch (err) {
        console.error("Error in showConversation:", err);
        res.redirect('/dashboard');
    }
}
