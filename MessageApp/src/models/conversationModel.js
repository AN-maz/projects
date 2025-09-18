const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        text: String,
        sender: { type: Schema.Types.ObjectId, ref: 'User' }
    },

    // --- NOTIVE MESSAGE ---
    unreadBy : [{
        type:Schema.Types.ObjectId,
        ref : 'User'
    }]
}, { timestamps: true });

const conversation = mongoose.model('Conversation', conversationSchema);
module.exports = conversation;