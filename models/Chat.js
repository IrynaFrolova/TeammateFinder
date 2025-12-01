const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    relatedAd: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ad' // Чат прив'язаний до конкретного оголошення
    },
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], // Масив з 2-х ID: [AuthorID, CandidateID]
    
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }],

    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);