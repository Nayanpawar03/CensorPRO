const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const moderationCategories = require('./server/moderationConfig');

app.use(express.json());

app.post('/api/moderate-text', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required for moderation.' });
    }

    const flaggedCategories = [];
    for (const category in moderationCategories) {
        const keywords = moderationCategories[category];
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword.replace(/[[\\]().+*?{}^$]/g, '\\$&')}\\b`, 'i');
            if (regex.test(text)) {
                flaggedCategories.push(category);
                break; 
            }
        }
    }

    if (flaggedCategories.length > 0) {
        res.json({ flagged: true, categories: flaggedCategories });
    } else {
        res.json({ flagged: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});