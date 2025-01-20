const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin login page
router.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: null });
});

// Admin login handle
router.post('/admin/login', async (req, res) => {
    console.log('Form submitted:', req.body); // Log form data
    
    try {
        const { username, password } = req.body;

        // Find user without admin check first
        const user = await User.findOne({ username });
        console.log('Found user:', {
            exists: !!user,
            username: user?.username,
            isAdmin: user?.isAdmin
        });

        if (!user) {
            return res.render('admin/login', {
                error: 'User not found',
                username
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.render('admin/login', {
                error: 'Invalid password',
                username
            });
        }

        if (!user.isAdmin) {
            return res.render('admin/login', {
                error: 'Not an admin user',
                username
            });
        }

        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = true;

        console.log('Session set:', req.session);

        res.redirect('/admin');

    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', {
            error: 'Server error: ' + error.message,
            username: req.body.username
        });
    }
});

// Test route to verify admin session
router.get('/admin/test-session', (req, res) => {
    res.json({
        session: {
            userId: req.session.userId,
            username: req.session.username,
            isAdmin: req.session.isAdmin
        }
    });
});

// Admin dashboard
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const selectedDay = req.query.day || 'monday';
        const editIndex = req.query.edit;
        const editMode = editIndex !== undefined;
        
        const workoutPlans = {
            monday: {
                plans: [
                    {
                        name: "Tập Ngực",
                        description: "4 hiệp x 12 lần, nghỉ 90 giây giữa các hiệp",
                        duration: 90,
                        image: "/images/chest.jpg"
                    }
                ]
            },
            tuesday: { plans: [] },
            wednesday: { plans: [] },
            thursday: { plans: [] },
            friday: { plans: [] },
            saturday: { plans: [] },
            sunday: { plans: [] }
        };

        const workout = editMode ? workoutPlans[selectedDay].plans[editIndex] : null;

        res.render('admin', {
            selectedDay,
            editMode,
            editIndex,
            workout,
            workoutPlans,
            username: req.session.username
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).send('Server Error');
    }
});

// Add new workout plan
router.post('/plans', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { day, name, description, duration } = req.body;
        // Handle image upload and save plan to database
        res.redirect('/admin?day=' + day);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Update workout plan
router.post('/plans/:day/:index', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { day, index } = req.params;
        const { name, description, duration } = req.body;
        // Update plan in database
        res.redirect('/admin?day=' + day);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Delete workout plan
router.post('/plans/:day/:index/delete', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { day, index } = req.params;
        // Delete plan from database
        res.redirect('/admin?day=' + day);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Create test admin account
router.get('/create-test-admin', async (req, res) => {
    try {
        // Delete any existing admin
        await User.deleteOne({ username: 'admin' });

        // Create new admin with simple password
        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            isAdmin: true
        });

        await admin.save();
        
        // Verify the user was created
        const verifyUser = await User.findOne({ username: 'admin' });
        
        res.json({
            message: 'Admin account created',
            userCreated: !!verifyUser,
            credentials: {
                username: 'admin',
                password: 'admin123'
            },
            verification: {
                exists: !!verifyUser,
                isAdmin: verifyUser?.isAdmin
            }
        });
    } catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check existing admin
router.get('/check-admin', async (req, res) => {
    try {
        const admin = await User.findOne({ username: 'admin' });
        res.json({
            exists: !!admin,
            user: admin ? {
                username: admin.username,
                isAdmin: admin.isAdmin,
                id: admin._id
            } : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 