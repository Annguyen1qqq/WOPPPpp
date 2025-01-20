const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Dashboard page
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        username: req.session.username
    });
});

module.exports = router; 