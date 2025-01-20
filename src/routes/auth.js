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
            password,
            // Make the first user an admin
            isAdmin: await User.countDocuments() === 0
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
        req.session.isAdmin = user.isAdmin;
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

// Temporary route to create admin - REMOVE AFTER USE
router.get('/create-admin', async (req, res) => {
    try {
        const adminUser = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',  // This will be hashed automatically
            isAdmin: true
        });
        
        await adminUser.save();
        res.json({ 
            message: 'Admin created successfully',
            credentials: {
                username: 'admin',
                password: 'admin123'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 