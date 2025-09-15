const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username tidak boleh kosong MasPur!'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password tidak boleh kosong MasPur!']
    },

    // TAMBAHAN BARU #1
    bio: {
        type: String,
        default: 'Halo! Saya pengguna baru MessageApp'
    },
    profilePicture: {
        type: String,
        default: 'default-avatar.png'
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// HASHING PASSWORD
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', UserSchema);