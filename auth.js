const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUser, updateDisplayName } = require('./db');
const { filterBadWords } = require('./wordFilter');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        await createUser(username, password);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await getUser(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });
            res.json({ token, username: user.username, displayName: user.displayName });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.post('/update-display-name', async (req, res) => {
    try {
        const { userId, newDisplayName } = req.body;
        const user = await getUser(userId);
        const lastChange = new Date(user.lastDisplayNameChange);
        const now = new Date();
        if (now - lastChange < 24 * 60 * 60 * 1000) {
            return res.status(400).json({ error: 'You can only change your display name once every 24 hours' });
        }
        const filteredName = filterBadWords(newDisplayName);
        await updateDisplayName(userId, filteredName);
        res.json({ message: 'Display name updated successfully', displayName: filteredName });
    } catch (error) {
        res.status(500).json({ error: 'Error updating display name' });
    }
});

module.exports = router;
