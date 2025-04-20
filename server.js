const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define schema and model
const ratingSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', ratingSchema);

// Route to receive and store rating
app.post('/submit-rating', async (req, res) => {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating' });
    }

    try {
        const newRating = new Rating({ rating });
        await newRating.save();
        res.json({ message: '✅ Rating saved to MongoDB!' });
    } catch (error) {
        console.error('Error saving rating:', error);
        res.status(500).json({ error: 'Failed to save rating' });
    }
});

// Optional route to fetch all ratings (for testing)
app.get('/ratings', async (req, res) => {
    try {
        const ratings = await Rating.find().sort({ timestamp: -1 });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
