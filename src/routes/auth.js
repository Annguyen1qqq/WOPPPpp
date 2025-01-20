const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Register handle
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, password2 } = req.body;
        
        // Validation
        if (!username || !email || !password || !password2) {
            return res.render('auth/register', { 
                error: 'Please fill in all fields' 
            });
        }
        
        if (password !== password2) {
            return res.render('auth/register', { 
                error: 'Passwords do not match' 
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.render('auth/register', { 
                error: 'Username or email already exists' 
            });
        }
        
        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });
        
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('auth/register', { 
            error: 'Server error' 
        });
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login handle
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('auth/login', { 
                error: 'Invalid credentials' 
            });
        }
        
        // Check password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login', { 
                error: 'Invalid credentials' 
            });
        }
        
        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('auth/login', { 
            error: 'Server error' 
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router; 