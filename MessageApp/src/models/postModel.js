const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. Kita definisikan skema dengan nama 'postSchema'
const postSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });


// 2. Kita gunakan nama 'postSchema' untuk menambahkan virtual field
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

// 3. Pastikan virtuals di-include
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });


// 4. Kita gunakan lagi 'postSchema' untuk membuat model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;