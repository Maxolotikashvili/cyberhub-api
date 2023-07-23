const express = require('express');
const router = express.Router();
const User = require('../../schemas/user.schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

router.post('/login', async (req, res) => {
    try {
        const userCredentials = req.body;

        const user = await User.findOne({
            $or: [{username: userCredentials.username}, { email: userCredentials.email }]
        });
        
        if (!user) {
            return res.status(401).json("User doesn't exist");
        }

        const passwordMatch = bcrypt.compare(userCredentials.password, user.password);

        if (!passwordMatch) {
            return res.status(401).json('Passwords do not match');
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, secretKey());
        res.status(200).json({message: 'Logged in successfuly', token: token});

    } catch(error) {
        console.log('Error loging user:', error);
        res.status(500).json('Internal server error');
    };
})

module.exports = router;