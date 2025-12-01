const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    relatedAd: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ad' 
    },
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], 
    
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }],

    lastUpdated: { 
        type: Date, 
        default: Date.now,
        // 604800 секунд = 7 днів.
        // MongoDB автоматично видалить цей запис, якщо з моменту lastUpdated пройде 7 днів.
        expires: 604800 
    }
});

module.exports = mongoose.model('Chat', ChatSchema);