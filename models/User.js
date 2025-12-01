const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }, // У реальності тут буде хеш пароля
    
	isAdmin: { type: Boolean, default: false },
	
    // Профіль (те, що бачать інші)
    profile: {
        avatarUrl: String,
        bio: String,
        skills: [String], // Масив навичок: ['JS', 'React']
        contacts: String  // Telegram, Discord тощо
    },

    // Налаштування приватності (хто що бачить)
    privacy: {
        showContacts: { type: Boolean, default: false }, // Чи показувати контакти всім
        isProfilePublic: { type: Boolean, default: true }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);