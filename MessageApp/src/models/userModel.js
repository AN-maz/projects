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
});

// HASHING PASSWORD
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.getSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);