const express = require('express');
const router = express.Router();
const Weight = require('../models/Weight');
const { isAuthenticated } = require('../middleware/auth');

// Get weight tracking page
router.get('/weight', isAuthenticated, (req, res) => {
    res.render('weight/index', {
        weights: []  // We'll add database integration later
    });
});

// Add new weight entry
router.post('/weight', isAuthenticated, async (req, res) => {
    try {
        const { weight, notes } = req.body;
        const newWeight = new Weight({
            userId: req.session.userId,
            weight,
            notes
        });
        await newWeight.save();
        res.redirect('/weight');
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Delete weight entry
router.delete('/weight/:id', isAuthenticated, async (req, res) => {
    try {
        await Weight.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

module.exports = router; 