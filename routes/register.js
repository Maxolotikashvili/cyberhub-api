const express = require('express');
const router = express.Router();
const User = require('../schemas/user.schema');

router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        
        const existingUser = await User.findOne({ $or: [{username: req.body.username}, {email: req.body.email}] })
        if (existingUser) {
            return res.status(409).json('User already exists');
        }
        
        await newUser.save();

        res.status(201).json('User registration successful');
    } catch(error) {
        console.error('Error registering user:', error);
        res.status(500).json('Error registering user:', error)
    }
});

module.exports = router;