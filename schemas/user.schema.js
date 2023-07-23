const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

UserSchema.pre('save', async function(next) {
    const user = this;

    if (user.isNew || user.isModified('password')) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
        } catch(error) {
            return next(error)
        }
    }

    return next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;