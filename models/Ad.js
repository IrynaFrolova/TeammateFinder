const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Зв'язок з користувачем
        required: true 
    },
    title: { type: String, required: true },
    game: { type: String, required: true },
    desc: String,
    
    // Фільтри
    level: String,
    lang: String,
    platform: String,
    time: String,
    
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', AdSchema);